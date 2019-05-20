'use strict';

/**
 * Create a new FreeformSelectionTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which drawing previews are shown
 */
function FreeformSelectionTool(cxt, preCxt) {
	SelectionTool.apply(this, arguments);
}
// Extend SelectionTool.
FreeformSelectionTool.prototype = Object.create(SelectionTool.prototype);
FreeformSelectionTool.prototype.constructor = FreeformSelectionTool;

/**
 * @override
 * Handle the tool being activated by a pointer.
 * @param {Object} pointerState - The pointer coordinates and button
 */
FreeformSelectionTool.prototype.start = function (pointerState) {
	pointerState.x = Math.round(pointerState.x);
	pointerState.y = Math.round(pointerState.y);
	
	// Hide the selection toolbar.
	this._toolbar.hide();
	
	// If a selection exists and the pointer is inside it, drag the selection.
	// Otherwise, start a new selection.
	if (this._selection &&
			Utils.isPointInRect(pointerState.x, pointerState.y,
				this._selection.minX, this._selection.minY,
				this._selection.width, this._selection.height)) {
		this._selection.pointerOffset = {
			x: pointerState.x - this._selection.minX,
			y: pointerState.y - this._selection.minY
		};
		if (pointerState.ctrlKey) {
			// If the Ctrl key is pressed, save a copy of the selection.
			this._saveSelection();
			this._selection.firstMove = false;
		}
		this._preCxt.canvas.style.cursor = 'move';
	} else {
		// Save any existing selection.
		this._saveSelection();
		// Start a new selection.
		this._selection = {
			minX: pointerState.x,
			minY: pointerState.y,
			maxX: pointerState.x,
			maxY: pointerState.y,
			points: [
				{
					x: pointerState.x,
					y: pointerState.y
				}
			],
			// The fill color should remain the same for this selection even if the PaintZ fill color changes.
			fillColor: settings.get('fillColor'),
			firstMove: true,
			transformed: false
		};
	}
};

/**
 * @override
 * Update the tool as the cursor moves.
 * @param {Object} pointerState - The pointer coordinates
 */
FreeformSelectionTool.prototype.move = function (pointerState) {
	if (!this._selection) {
		return;
	}
	
	pointerState.x = Math.round(pointerState.x);
	pointerState.y = Math.round(pointerState.y);
	
	Utils.clearCanvas(this._preCxt);
	
	// If there is a poinetr offset, move the selection.
	// If there is no pointer offset, then this must be a new selection.
	if (this._selection.pointerOffset) {
		this._selection.x = pointerState.x - this._selection.pointerOffset.x;
		this._selection.y = pointerState.y - this._selection.pointerOffset.y;
		this._drawSelectionContent();
		this._updateSelectionOutline();
	} else {
		// Limit the region to the canvas.
		pointerState.x = Utils.constrainValue(pointerState.x, 0, this._cxt.canvas.width);
		pointerState.y = Utils.constrainValue(pointerState.y, 0, this._cxt.canvas.height);
		
		this._selection.points.push({
			x: pointerState.x,
			y: pointerState.y
		});
		
		if (pointerState.x < this._selection.minX) {
			this._selection.minX = pointerState.x;
		}
		if (pointerState.y < this._selection.minY) {
			this._selection.minY = pointerState.y;
		}
		if (pointerState.x > this._selection.maxX) {
			this._selection.maxX = pointerState.x;
		}
		if (pointerState.y > this._selection.maxY) {
			this._selection.maxY = pointerState.y;
		}
		
		
	}
};
