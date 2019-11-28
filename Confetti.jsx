/*
  https://github.com/Inventsable/Confetti
  contact: tom@inventsable.cc

  Barebones script to paint selection of simple paths randomly according to Swatch Group

  Made by request of https://www.reddit.com/r/AdobeIllustrator/comments/e2gks4/how_to_color_shapes_randomly/
*/

var doc = app.activeDocument;
randomlyColorSelection();

// Retrieve Swatch groups and assign unnamed collection as 'All'
function getSwatchGroups() {
  var groups = [];
  if (doc.swatchGroups.length)
    for (var i = 0; i < doc.swatchGroups.length; i++)
      groups.push(doc.swatchGroups[i].name);
  for (var i = 0; i < groups.length; i++)
    if (!groups[i].length) groups[i] = "All";
  return groups;
}

// Gather the data from Groups and the dialog, then retrieve the target swatches as array
function getSwatches() {
  var groups = getSwatchGroups();
  var modal = showDialog();
  var swatchGroupName = modal.dropDown.List.selection;
  if (/all/i.test(groups[Number(modal.dropDown.List.selection)])) {
    for (var i = 0; i < doc.swatchGroups.length; i++)
      if (!doc.swatchGroups[i].name.length)
        return doc.swatchGroups[i].getAllSwatches();
  } else if (swatchGroupName && doc.swatchGroups.getByName(swatchGroupName))
    return doc.swatchGroups.getByName(swatchGroupName).getAllSwatches();
  else return null;
}

// Show modal dialog with dropdownlist of the group results
function showDialog() {
  // Illustrator can't render ScriptUI modals with resizeable or set bounds
  // Doing so renders a blank window, so the dropdown will often clip (but arrow keys can be used)
  var groups = getSwatchGroups();
  var modal = new Window("dialog", "Choose a Swatch Group to paint with");
  modal.orientation = "column";
  modal.alignment = "right";
  modal.dropDown = modal.add("group");
  modal.dropDown.orientation = "row";
  modal.dropDown.add("statictext", undefined, "Swatch Group");
  modal.dropDown.List = modal.dropDown.add(
    "dropdownlist",
    undefined,
    undefined,
    {
      items: groups
    }
  );
  modal.dropDown.List.selection = 0;
  modal.confirm = modal.add("button", undefined, "OK");
  modal.confirm.onClick = function() {
    this.parent.close();
  };
  modal.show();
  return modal;
}

// Assign color values to any valid selected PathItem object
function randomlyColorSelection() {
  if (app.selection.length < 1) return alert("Must have a selection");
  var swatches = getSwatches();
  if (!swatches) return alert("Must have matching SwatchGroup name");
  var colors = [];
  for (var i = 0; i < swatches.length; i++) colors.push(swatches[i].color);
  var valids = [];
  for (var i = 0; i < app.selection.length; i++)
    if (/pathitem/i.test(app.selection[i].typename))
      valids.push(app.selection[i]);
  if (colors.length && valids.length)
    for (var i = 0; i < valids.length; i++) {
      var path = valids[i];
      var randomColor = colors[randomInt(0, colors.length - 1)];
      path.strokeColor = path.stroked ? randomColor : path.strokeColor;
      path.fillColor = path.filled ? randomColor : path.fillColor;
    }
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
