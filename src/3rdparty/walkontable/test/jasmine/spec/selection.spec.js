describe('WalkontableSelection', function () {
  var $table
    , debug = false;

  beforeEach(function () {
    $container = $('<div></div>').css({'overflow': 'auto'});
    $container.width(100).height(200);
    $table = $('<table></table>'); //create a table that is not attached to document
    $container.append($table).appendTo('body');
    createDataArray();
  });

  afterEach(function () {
    if (!debug) {
      $('.wtHolder').remove();
    }
    $container.remove();
  });

  it("should add/remove class to selection when cell is clicked", function () {
    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      offsetRow: 0,
      offsetColumn: 0,
      height: 200,
      width: 100,
      selections: {
        current: {
          className: 'current'
        }
      },
      onCellMouseDown: function (event, coords, TD) {
        wt.selections.current.clear();
        wt.selections.current.add(coords);
        wt.draw();
      }
    });
    wt.draw();

    var $td1 = $table.find('tbody td:eq(0)');
    var $td2 = $table.find('tbody td:eq(1)');
    $td1.mousedown();
    expect($td1.hasClass('current')).toEqual(true);

    $td2.mousedown();
    expect($td1.hasClass('current')).toEqual(false);
    expect($td2.hasClass('current')).toEqual(true);
  });

  it("should not add class to selection until it is rerendered", function () {
    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      offsetRow: 0,
      offsetColumn: 0,
      height: 200,
      width: 100,
      selections: {
        current: {
          className: 'current'
        }
      }
    });
    wt.draw();
    wt.selections.current.add(new WalkontableCellCoords(0, 0));

    var $td1 = $table.find('tbody td:eq(0)');
    expect($td1.hasClass('current')).toEqual(false);

    wt.draw();
    expect($td1.hasClass('current')).toEqual(true);
  });

  it("should add/remove border to selection when cell is clicked", function () {
    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      offsetRow: 0,
      offsetColumn: 0,
      height: 200,
      width: 100,
      selections: {
        current: {
          border: {
            width: 1,
            color: 'red',
            style: 'solid'
          }
        }
      },
      onCellMouseDown: function (event, coords, TD) {
        wt.selections.current.clear();
        wt.selections.current.add(coords);
        wt.draw();
      }
    });
    wt.draw();

    var $td1 = $table.find('tbody tr:eq(1) td:eq(0)');
    var $td2 = $table.find('tbody tr:eq(2) td:eq(1)');
    var $top = $(wt.selections.current.border.top);
    $td1.mousedown();
    var pos1 = $top.position();
    expect(pos1.top).toBeGreaterThan(0);
    expect(pos1.left).toBe(0);

    $td2.mousedown();
    var pos2 = $top.position();
    expect(pos2.top).toBeGreaterThan(pos1.top);
    expect(pos2.left).toBeGreaterThan(pos1.left);
  });

  it("should add a selection that is outside of the viewport", function () {
    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      offsetRow: 0,
      offsetColumn: 0,
      height: 200,
      width: 150,
      selections: {
        current: {
          border: {
            width: 1,
            color: 'red',
            style: 'solid'
          }
        }
      }
    });
    wt.draw();

    wt.selections.current.add([20, 0]);
    expect(wt.wtTable.getCoords($table.find('tbody tr:first td:first')[0])).toEqual(new WalkontableCellCoords(0, 0));
  });

  it("should not scroll the viewport after selection is cleared", function () {
    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      offsetRow: 0,
      offsetColumn: 0,
      height: 200,
      width: 150,
      selections: {
        current: {
          border: {
            width: 1,
            color: 'red',
            style: 'solid'
          }
        }
      }
    });
    wt.draw();

    wt.selections.current.add(new WalkontableCellCoords(0, 0));
    wt.draw();
    expect(wt.wtTable.getFirstVisibleRow()).toEqual(0);
    wt.scrollVertical(10).draw();
    expect(wt.wtTable.getFirstVisibleRow()).toEqual(10);
    wt.selections.current.clear();
    expect(wt.wtTable.getFirstVisibleRow()).toEqual(10);
  });

  it("should clear a selection that has more than one cell", function () {
    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      offsetRow: 0,
      offsetColumn: 0,
      height: 200,
      width: 150,
      selections: {
        current: {
          border: {
            width: 1,
            color: 'red',
            style: 'solid'
          }
        }
      }
    });
    wt.draw();

    wt.selections.current.add(new WalkontableCellCoords(0, 0));
    wt.selections.current.add(new WalkontableCellCoords(0, 1));
    wt.selections.current.clear();

    expect(wt.selections.current.cellRange).toEqual(null);
  });

  it("should highlight cells in selected row & column", function () {

    $container.width(300);

    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      offsetRow: 0,
      offsetColumn: 0,
      height: 200,
      width: 300,
      selections: {
        area: {
          highlightRowClassName: 'highlightRow',
          highlightColumnClassName: 'highlightColumn'
        }
      }
    });
    wt.draw();

    wt.selections.area.add(new WalkontableCellCoords(0, 0));
    wt.selections.area.add(new WalkontableCellCoords(0, 1));
    wt.draw(true);

    expect($table.find('.highlightRow').length).toEqual(2);
    expect($table.find('.highlightColumn').length).toEqual(wt.wtTable.rowStrategy.countVisible() * 2 - 2);
  });

  it("should highlight cells in selected row & column, when same class is shared between 2 selection definitions", function () {
    var rowHeight = 23; //measured in real life with walkontable.css
    var height = 200;

    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      offsetRow: 0,
      offsetColumn: 0,
      height: 200,
      width: 300,
      selections: {
        current: {
          highlightRowClassName: 'highlightRow',
          highlightColumnClassName: 'highlightColumn'
        },
        area: {
          highlightRowClassName: 'highlightRow',
          highlightColumnClassName: 'highlightColumn'
        }
      }
    });
    wt.draw();

    wt.selections.current.add(new WalkontableCellCoords(0, 0));
    wt.draw(true);

    expect($table.find('.highlightRow').length).toEqual(3);
    expect($table.find('.highlightColumn').length).toEqual(wt.wtTable.rowStrategy.countVisible() - 1);
  });

  it("should remove highlight when selection is deselected", function () {
    var wt = new Walkontable({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      offsetRow: 0,
      offsetColumn: 0,
      height: 200,
      width: 300,
      selections: {
        area: {
          highlightRowClassName: 'highlightRow',
          highlightColumnClassName: 'highlightColumn'
        }
      }
    });
    wt.draw();

    wt.selections.area.add(new WalkontableCellCoords(0, 0));
    wt.selections.area.add(new WalkontableCellCoords(0, 1));
    wt.draw();

    wt.selections.area.clear();
    wt.draw();

    expect($table.find('.highlightRow').length).toEqual(0);
    expect($table.find('.highlightColumn').length).toEqual(0);
  });

  describe("replace", function() {
    it("should replace range from property and return true", function() {
      var wt = new Walkontable({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns,
        offsetRow: 0,
        offsetColumn: 0,
        height: 200,
        selections: {
          current: {
            className: 'current',
            border: {
              width: 1,
              color: 'red',
              style: 'solid'
            }
          }
        }
      });

      wt.selections.current.add(new WalkontableCellCoords(1, 1));
      wt.selections.current.add(new WalkontableCellCoords(3, 3));
      var result = wt.selections.current.replace(new WalkontableCellCoords(3, 3), new WalkontableCellCoords(4, 4));
      expect(result).toBe(true);
      expect(wt.selections.current.getCorners()).toEqual([1, 1, 4, 4]);
    });
  });
});