describe('manualRowResize', function () {
  var id = 'test';
  var defaultRowHeight = 22;

  beforeEach(function () {
    this.$container = $('<div id="' + id + '"></div>').appendTo('body');
  });

  afterEach(function () {
    if (this.$container) {
      destroy();
      this.$container.remove();
    }
  });

  function resizeRow(displayedRowIndex, height) {

    var $container = spec().$container;
    var $th = $container.find('tbody tr:eq(' + displayedRowIndex + ') th:eq(0)');

    $th.trigger('mouseenter');

    var $resizer = $container.find('.manualRowResizer');
    var resizerPosition = $resizer.position();

    var mouseDownEvent = new $.Event('mousedown', {pageY: resizerPosition.top});
    $resizer.trigger(mouseDownEvent);

    var delta = height - $th.height() - 2;

    if (delta < 0) {
      delta = 0;
    }

    var mouseMoveEvent = new $.Event('mousemove', {pageY: resizerPosition.top + delta});
    $resizer.trigger(mouseMoveEvent);

    $resizer.trigger('mouseup');
  }

  it("should change row heights at init", function () {
    handsontable({
      rowHeaders: true,
      manualRowResize: [50, 40, 100]
    });

    expect(rowHeight(this.$container, 0)).toEqual(50);
    expect(rowHeight(this.$container, 1)).toEqual(40);
    expect(rowHeight(this.$container, 2)).toEqual(100);
  });

  it("should change the default row height with updateSettings", function () {
    handsontable({
      manualRowResize: true
    });

    expect(rowHeight(this.$container, 0)).toEqual(defaultRowHeight);
    expect(rowHeight(this.$container, 1)).toEqual(defaultRowHeight);
    expect(rowHeight(this.$container, 2)).toEqual(defaultRowHeight);

    updateSettings({
      manualRowResize: [60, 50, 80]
    });

    expect(rowHeight(this.$container, 0)).toEqual(60);
    expect(rowHeight(this.$container, 1)).toEqual(50);
    expect(rowHeight(this.$container, 2)).toEqual(80);
  });

  it("should change the row height with updateSettings", function () {
    handsontable({
      manualRowResize: [60, 50, 80]
    });

    expect(rowHeight(this.$container, 0)).toEqual(60);
    expect(rowHeight(this.$container, 1)).toEqual(50);
    expect(rowHeight(this.$container, 2)).toEqual(80);

    updateSettings({
      manualRowResize: [30, 80, 100]
    });

    expect(rowHeight(this.$container, 0)).toEqual(30);
    expect(rowHeight(this.$container, 1)).toEqual(80);
    expect(rowHeight(this.$container, 2)).toEqual(100);
  });

  it("should reset row height", function () {
    handsontable({
      manualRowResize: true
    });

    expect(rowHeight(this.$container, 0)).toEqual(defaultRowHeight);
    expect(rowHeight(this.$container, 1)).toEqual(defaultRowHeight);
    expect(rowHeight(this.$container, 2)).toEqual(defaultRowHeight);

    updateSettings({
      manualRowResize: true
    });

    expect(rowHeight(this.$container, 0)).toEqual(defaultRowHeight);
    expect(rowHeight(this.$container, 1)).toEqual(defaultRowHeight);
    expect(rowHeight(this.$container, 2)).toEqual(defaultRowHeight);
  });

  it("should trigger afterRowResize event after row height changes", function () {
    var afterRowResizeCallback = jasmine.createSpy('afterRowResizeCallback');

    handsontable({
      data: createSpreadsheetData(5, 5),
      rowHeaders: true,
      manualRowResize: true,
      afterRowResize: afterRowResizeCallback
    });

    expect(rowHeight(this.$container, 0)).toEqual(defaultRowHeight);

    resizeRow(0, 100);
    expect(afterRowResizeCallback).toHaveBeenCalledWith(0, 100, void 0, void 0, void 0);
    expect(rowHeight(this.$container, 0)).toEqual(100);
  });

  it("should not trigger afterRowResize event if row height does not change (delta = 0)", function () {
    var afterRowResizeCallback = jasmine.createSpy('afterRowResizeCallback');

    handsontable({
      data: createSpreadsheetData(5, 5),
      rowHeaders: true,
      manualRowResize: true,
      afterRowResize: afterRowResizeCallback
    });

    expect(rowHeight(this.$container, 0)).toEqual(defaultRowHeight);

    resizeRow(0, defaultRowHeight);
    expect(afterRowResizeCallback).not.toHaveBeenCalled();
    expect(rowHeight(this.$container, 0)).toEqual(defaultRowHeight);
  });

  it("should not trigger afterRowResize event after if row height does not change (no mousemove event)", function () {
    var afterRowResizeCallback = jasmine.createSpy('afterRowResizeCallback');

    handsontable({
      data: createSpreadsheetData(5, 5),
      rowHeaders: true,
      manualRowResize: true,
      afterRowResize: afterRowResizeCallback
    });

    expect(rowHeight(this.$container, 0)).toEqual(defaultRowHeight);

    var $th = this.$container.find('tbody tr:eq(0) th:eq(0)');
    $th.trigger('mouseenter');

    var $resizer = this.$container.find('.manualRowResizer');
    var resizerPosition = $resizer.position();

    var mouseDownEvent = new $.Event('mousedown', {pageY: resizerPosition.top});
    $resizer.trigger(mouseDownEvent);

    $resizer.trigger('mouseup');

    expect(afterRowResizeCallback).not.toHaveBeenCalled();
    expect(rowHeight(this.$container, 0)).toEqual(defaultRowHeight);
  });

  it("should trigger an afterRowResize after row size changes, after double click", function () {
    var afterRowResizeCallback = jasmine.createSpy('afterRowResizeCallback');

    handsontable({
      data: createSpreadsheetData(5, 5),
      rowHeaders: true,
      manualRowResize: true,
      afterRowResize: afterRowResizeCallback
    });

    expect(rowHeight(this.$container, 0)).toEqual(defaultRowHeight);

    var $th = this.$container.find('tbody tr:eq(2) th:eq(0)');
    $th.trigger('mouseenter');

    var $resizer = this.$container.find('.manualRowResizer');
    var resizerPosition = $resizer.position();

    var mouseDownEvent = new $.Event('mousedown', {pageY: resizerPosition.top});
    $resizer.trigger(mouseDownEvent);
    $resizer.trigger('mouseup');

    mouseDownEvent = new $.Event('mousedown', {pageY: resizerPosition.top});
    $resizer.trigger(mouseDownEvent);
    $resizer.trigger('mouseup');

    waitsFor(function() {
      return afterRowResizeCallback.calls.length > 0;
    }, 'Row resize', 500);

    runs(function () {
      expect(afterRowResizeCallback.calls.length).toEqual(1);
      expect(afterRowResizeCallback.calls[0].args[0]).toEqual(2);

      expect(afterRowResizeCallback.calls[0].args[1]).toEqual(defaultRowHeight + 1);
      expect(rowHeight(this.$container, 2)).toEqual(defaultRowHeight);
    });
  });

  it("should not trigger afterRowResize event after if row height does not change (no dblclick event)", function () {
    var afterRowResizeCallback = jasmine.createSpy('afterRowResizeCallback');

    handsontable({
      data: createSpreadsheetData(5, 5),
      rowHeaders: true,
      manualRowResize: true,
      afterRowResize: afterRowResizeCallback
    });

    expect(rowHeight(this.$container, 0)).toEqual(defaultRowHeight);

    var $th = this.$container.find('tbody tr:eq(2) th:eq(0)');
    $th.trigger('mouseenter');

    var $resizer = this.$container.find('.manualRowResizer');
    var resizerPosition = $resizer.position();

    var mouseDownEvent = new $.Event('mousedown', {pageY: resizerPosition.top});
    $resizer.trigger(mouseDownEvent);
    $resizer.trigger('mouseup');

    expect(afterRowResizeCallback).not.toHaveBeenCalled();
    expect(rowHeight(this.$container, 0)).toEqual(defaultRowHeight);
  })
});
