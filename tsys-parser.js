
function hit(a, b) {
    //console.log(a.value, b);
}

function foc(a, b, c) {
   // console.log("testing " + c);
}


function showLoad(e) {
    console.log("hello", e);
}

function showModal(v) {
    let id = guid();

   // generatePopUp();
}

function showPayments(e){
    let val = $(e).val();
    if (val == 'Credit Card Payment') {
        $(".PD_credit_card").removeClass("is_hidden");
        $(".PD_check_payment").addClass("is_hidden");
    } else if (val == 'ACH/Check Payment') {
        $(".PD_check_payment").removeClass("is_hidden");
        $(".PD_credit_card").addClass("is_hidden");
    } else {
        $(".PD_check_payment").addClass("is_hidden");
        $(".PD_credit_card").addClass("is_hidden");
    }

}

function showOwners(e) {
    if ($(e).val()) {
        let n = Number($(e).val());
        for (let i = 1; i <= 4; i++) {
            if (i <= n) {
                $(".owner_" + i).removeClass('is_hidden');
            } else {
                $(".owner_" + i).addClass('is_hidden');
            }
            
        }
    }
}

function showFields(e, set) {
    if ($(e).val().toLowerCase() == 'yes') {
        $("input[name='" + set + "']").parents(".ck-rd-box").removeClass("is_hidden");
    } else {
        $("input[name='" + set + "']").parents(".ck-rd-box").addClass("is_hidden");
    }
}

function updateName(e, get, set) {
    if ($(e).is(":checked")) {
        if ($("input[name='" + get + "']").val()) {
            $("input[name='" + set + "']").parent().removeClass('is-empty');
            $("input[name='" + set + "']").val($("input[name='" + get + "']").val());
        }
    } else {
        $("input[name='" + set + "']").val('');
        $("input[name='" + set + "']").parent().addClass('is-empty');
    }
}



// to strore validation objects
var validation = {};
var validation_messages = {};

$(document).ready(function () {

    let data = null;
    var id = GetParameterValues('id');
    
    $.ajax({
        url: "/home/GetSFDCInfo?tsysid="+id, success: function (result) {
            data = JSON.parse(result);
            init(data);
        }, error: function (xhr, status, error) {
            alert("There was an error " + error);
        }
    });

});

function GetParameterValues(param) {
    var url = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < url.length; i++) {
        var urlparam = url[i].split('=');
        if (urlparam[0].toLowerCase() == param) {
            return urlparam[1];
        }
    }
}  

function init(data) {
    //generate tab links
    generateLinks(data);
    
    console.log(data);
    

    //init theme
    $(".wizard-container").addClass(data.theme_name);

    //generate each tab
    data.tabs.forEach(function (e) {
        generateTab(e);

    });

    //init material bootstrap
    initMaterialBootstrap();

    //console.log(JSON.stringify($('form#processing').serializeArray()));
    //console.log(JSON.stringify($('form#business').serializeArray()));

    //init date-picker
    $.fn.datepicker.defaults.format = data.date_format;
    $(".date > input").datepicker();

    //init MultiSelect
    $(".multiple").multiselect({
        includeSelectAllOption: true,
        enableFiltering: true,
        enableCaseInsensitiveFiltering: true,
        buttonClass: 'form-control',
        buttonWidth: 'auto',
        buttonText: function (options) {

            if (options.length == 0) {
                return '';
            }
            else if (options.length > 6) {
                return options.length + ' selected';
            }
            else {
                var selected = '';
                options.each(function () {
                    selected += $(this).text() + ', ';
                });
                return selected.substr(0, selected.length - 2);
            }
        }
    });
}


//generates random id;
function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function renderTooltip(txt) {
    let text = '<span data-placement="bottom" rel = "tooltip" title = "' + txt + '" >'
        + '<i class="material-icons">info</i>'
        + '</span>';

    return text;
}

function renderDropDown(e) {
    //required
    let name = e.name;

    //infotext
    let cls = e.info_tooltip !== null ? " contains-info" : "";
    let info = renderTooltip(e.info_tooltip);
    let info_text = e.info_tooltip !== null ? info : "";

    //options
    let options = "";
    let isAnySelected = false;

    e.options.forEach(function (g) {
        let a = "";
        if (g == e.value) {
            isAnySelected = true;
            a = "selected";
        }
        options += '<option value="' + g + '" ' + a + '> ' + g + '</option>';
    });

    //if is hidden
    if (!e.visible) {
        cls += ' is_hidden';
    }

    if (!isAnySelected) {
        options = '<option disabled="" selected=""></option>' + options;
    } else {
        options = '<option disabled="" ></option>' + options;
    }

    let disabled = e.disabled && e.disabled == true ? "disabled" : "";
    let label_floating = " label-floating";

    //eventlistners
    let ev = "";
    for (key in e.events) {
        ev += `${key} = ${e.events[key]} `;
    }

    let isRequired = e.validation.required ? "is_required" : ""; 

    //render
    let text = '<div class="col-sm-6 drp-down' + cls + '">'
                + '<div class="form-group label-floating' + label_floating + '">'
                + '<label class="control-label ' + isRequired+'" >' + e.label + '</label>'
                + '<select '+ ev + ' name="'+name+'" class="form-control" '+disabled+'>'
                + options
                + '</select>'
                + '</div>'
                + info_text
                + '</div>';

    return text;
}

function renderMultiSelectDropDown(e) {
    //required
    let name = e.name.trim();

    //infotext
    let cls = e.info_tooltip !== null ? " contains-info" : "";
    let info = renderTooltip(e.info_tooltip);
    let info_text = e.info_tooltip !== null ? info : "";

    //options
    let options = "";
    let isAnySelected = false;
    let disabled = e.disabled && e.disabled == true ? "disabled" : "";

    //mark ; separated values to true
    if (e.value) {
        let value = e.value.split(';');
        value.forEach(function (f) {
            e.options.forEach(function (g) {
                if (g.label === f.trim()) {
                    g.checked = true;
                }
            });
        });
    }


    e.options.forEach(function (g) {
        let a = "";
        if (true == g.checked) {
            isAnySelected = true;
            a = "selected";
        }
        options += '<option value="' + g.label + '" ' + a + '> ' + g.label + '</option>';
    });

    let label_floating = isAnySelected === true ? " label-floating is-focused multiselect-label-floating" : " label-floating";

    //eventlistners
    let ev = "";
    for (key in e.events) {
        ev += `${key} = ${e.events[key]} `;
    }

    //if is hidden
    if (!e.visible) {
        cls += ' is_hidden';
    }

    let isRequired = e.validation.required ? "is_required" : ""; 

    //render
    let text = '<div class="col-sm-6 multi-drp-down' + cls + '">'
        + '<div class="form-group' + label_floating + '">'
        + '<label class="control-label ' + isRequired + '" >' + e.label + '</label>'
        + '<select '+ev+ ' name="' + name + '" class="form-control multiple" multiple="multiple"  '+disabled+'>'
        + options
        + '</select>'
        + '</div>'
        + info_text
        + '</div>';

    return text;
}

function renderCheckBoxesAndRadioBoxes(e) {
    //required
    let name = e.name.trim();

    //info
    let cls = e.info_tooltip !== null ? "contains-info" : "";
    let info = renderTooltip(e.info_tooltip);
    let info_text = e.info_tooltip !== null ? info : "";
    let type = e.type;

    //eventlistners
    let ev = "";
    for (key in e.events) {
        ev += `${key} = ${e.events[key]} `;
    }

    //mark ; separated values to true
    if (e.value) {
        let value = e.value.split(';');
        value.forEach(function (f) {
            e.options.forEach(function (g) {
                if (g.label === f.trim()) {
                    g.checked = true;
                }
            });
        });
    }

    //checkboxes
    let checkboxes = "";
    cls = cls + " " + e.classname;
    let count = e.options.length > 4 ? 3 : 12 / e.options.length;
    let disabled = e.disabled && e.disabled == true ? "disabled" : "";
    e.options.forEach(function (g) {
        let a = g.checked ? "checked" : "";
        checkboxes += '<div class="col-xs-12 col-sm-4 col-md-'+count+' ' + type + '">'
            + '<label>'
            + '<input ' + ev + ' type="' + e.type + '" name="' + name + '" value="' + g.label + '" ' + a + ' '+disabled+'>'
            + g.label
            + '</label>'
            + '</div>'
    });

    //if is hidden
    if (!e.visible) {
        cls += ' is_hidden';
    }

    let isRequired = e.validation.required ? "is_required" : ""; 

    //render
    let text = '<div class="col-sm-12 ck-rd-box'+cls+'">'
        + '<div class="form-group">'
        + '<label class="control-label checkboxes ' + isRequired + '" >' + e.label + '</label>'
        + '<div class="row">'
        + checkboxes
        + '</div>'
        + '</div>'
        + info_text
        + '</div>'
    return text;
}



function renderFields(e) {
    //required
    let name = e.name.trim();

    //info
    let cls = e.info_tooltip !== null ? "contains-info" : "";
    let info = renderTooltip(e.info_tooltip);
    let info_text = e.info_tooltip !== null ? info : "";
    let label_floating = e.type != 'date' ? 'label-floating' : '';
    cls = cls + " " + e.classname;

    //if is hidden
    if (!e.visible) {
        cls += ' is_hidden';
    }

    //eventlistners
    let ev = "";
    for (key in e.events) {
        ev += `${key} = ${e.events[key]} `;
    }

    let disabled = e.disabled && e.disabled == true ? "disabled" : "";

    let temp = e.type === 'textarea' ? `<textarea class="form-control" rows="5" ${ev} name="${name}" value="${(e.value != null ? e.value : "")}" ${disabled} ></textarea>` : `<input ${disabled} type="${e.type}" class="form-control" name="${name}" value="${(e.value != null ? e.value : "")}" ${ev}>`;
     
    let div = e.type === 'textarea' ? cls += " col-sm-12" : cls += " col-sm-6"; 

    let isRequired = e.validation.required ? "is_required" : ""; 

    //render
    let text = '<div class="fields ' + cls + '">'
        + '<div class="form-group ' + label_floating + '">'
        + '<label class="control-label ' + isRequired + '">' + e.label + '</label>'
        + temp
        + '</div>'
        + info_text
        + '</div>';

    return text;

}

function renderTextDisplayer(e) {
    let label = e.label || "";
    let name = e.className || "";
    let text = '<div class="col-xs-12 text-displayer '+name+'">'
        + '<h3 class="group-sub-heading">' + label +'</h3>'
        + '</div>';

    return text;
}


function renderDatePicker(e) {
    //required
    let name = e.name.trim();

    //info
    let cls = e.info_tooltip !== null ? "contains-info" : "";
    let info = renderTooltip(e.info_tooltip);
    let info_text = e.info_tooltip !== null ? info : "";

    //if is hidden
    if (!e.visible) {
        cls += ' is_hidden';
    }

    //eventlistners
    let ev = "";
    for (key in e.events) {
        ev += `${key} = ${e.events[key]} `;
    }

    let disabled = e.disabled && e.disabled == true ? "disabled" : "";

    let isRequired = e.validation.required ? "is_required" : ""; 

    //render
    let text = '<div class="col-sm-6 date-picker ' + cls + '">'
        + '<div class="form-group label-floating input-group date" data-provide="datepicker">'
        + '<label class="control-label ' + isRequired + '">' + e.label + '</label>'
        + '<input type="text" class="form-control" '+ev+' name="' + name + '" value="' + (e.value != null ? e.value : "") + '"  '+disabled+'>'
        + '<div class="input-group-addon">'
        + '<span class="material-icons">date_range</span>'
        + '</div>'
        + '</div>'
        + info_text
        + '</div>';
    return text;
}

function renderUpload(e) {
    //required
    let name = e.name.trim();

    //eventlistners
    let ev = "";
    for (key in e.events) {
        ev += `${key} = ${e.events[key]} `;
    }

    let cls = e.info_tooltip !== null ? "contains-info" : "";
    let info = renderTooltip(e.info_tooltip);
    let info_text = e.info_tooltip !== null ? info : "";

    //if is hidden
    if (!e.visible) {
        cls += ' is_hidden';
    }

    let multiple = e.multiple ? "multiple" : "";

    let disabled = e.disabled && e.disabled == true ? "disabled" : "";

    let isRequired = e.validation.required ? "is_required" : ""; 

    //render
    let text = '<div class="col-sm-6 mb-10 upload '+cls+'">'
        + '<div class="picture-container form-group">'
        + '<h4 class="info_text">'+e.label+'</h4>'
        + '<div class="picture">'
        + '<img src="~/../images/upload-icon.png" class="file-src wizardPicturePreview" title="Upload file">'
        + '<input "'+disabled+'" type="file" class="wizard-file" name="'+name+'" '+ev+'  '+multiple+'/>'
        + '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 37 37" style="enable-background:new 0 0 37 37;" xml:space="preserve">'
        + '<path class="circ path" style="fill:none;stroke:#77d27b;stroke-width:3;stroke-linejoin:round;stroke-miterlimit:10;" d="'
        + 'M30.5,6.5L30.5,6.5c6.6,6.6,6.6,17.4,0,24l0,0c-6.6,6.6-17.4,6.6-24,0l0,0c-6.6-6.6-6.6-17.4,0-24l0,0C13.1-0.2,23.9-0.2,30.5,6.5z"></path>'
        + '<polyline class="tick path" style="fill:none;stroke:#77d27b;stroke-width:3;stroke-linejoin:round;stroke-miterlimit:10;" points="'
        + '11.6,20 15.9,24.2 26.4,13.8 "></polyline>'
        + '</svg>'
        + '</div>'
        + '</div>'
        + info_text
        + '</div>';

    return text;
}


function generatePopUp(e) {
    let text = '';
    if (e.data) {
        e.data.forEach(function (f) {
            let header = f.heading;
            let ge = generateGroups(f);
            let id = f.id;
            text += '<div class="modal fade" id="' + id + '" role="dialog">'
                + '<div class="modal-dialog modal-lg">'
                + '<div class="modal-content">'
                + '<div class="modal-header">'
                + '<button type="button" class="close" data-dismiss="modal"><i class="material-icons">close</i></button>'
                + '<h3 class="modal-title"><b>' + header + '</b></h3>'
                + '</div>'
                + '<div class="modal-body row">'
                + ge
                + '</div>'
                + '<div class="modal-footer">'
                + '<button type="button" class="btn btn-danger" data-dismiss="modal">Close</button>'
                + '</div>'
                + '</div>'
                + '</div>'
                + '</div>';
        });
    }
    return text;
}


function generateTab(e) {

    //let fields = generateFields(e);
    let groups = generateGroups(e);

    //render table 
    let table = '';
    if (e.table) {
        table = generateTables(e);
    }

    //render popups
    let popups = e.popup ? generatePopUp(e.popup) : '';
    

    let ids = e.name.split(" ").join("-");

    //render
    let text = '<div class="tab-pane" id="' + ids + '">'
        + '<h3 class="info-text"> ' + e.heading
        + '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"'
        + 'viewBox="0 0 37 37" style="enable-background:new 0 0 37 37;" xml:space="preserve">'
        + '<path class="circ path" style="fill:none;stroke:#77d27b;stroke-width:3;stroke-linejoin:round;stroke-miterlimit:10;" d="'
        + 'M30.5,6.5L30.5,6.5c6.6,6.6,6.6,17.4,0,24l0,0c-6.6,6.6-17.4,6.6-24,0l0,0c-6.6-6.6-6.6-17.4,0-24l0,0C13.1-0.2,23.9-0.2,30.5,6.5z"'
        + '/>'
        + '<polyline class="tick path" style="fill:none;stroke:#77d27b;stroke-width:3;stroke-linejoin:round;stroke-miterlimit:10;" points="'
        + '11.6,20 15.9,24.2 26.4,13.8 "/>'
        + '</svg>'
        + '</h3>'
        + '<div class="row">'
        + '<form id="' + ids + '" >'
        +  groups
        +  table
        + '</form>'
        + '</div>'
        + popups
        + '</div>';

    $(".tab-content").prepend(text);
}

function generateFields(e) {
    //generate fields
    let fields = "";
    
    e.fields.forEach(function (f) {

        if (f.type != "text-displayer") {
            //validation rules
            let a = JSON.parse(JSON.stringify(f.validation));
            let b = a.error_msg;
            delete a.error_msg;
            let ob = {};
            ob[f.name] = a;
            Object.assign(validation, ob);

            //validation messages
            let ob2 = {};
            ob2[f.name] = { required: b };
            Object.assign(validation_messages, ob2);
        }

        //rendering fields
        switch (f.type) {
            case "select":
                fields += renderDropDown(f);
                break;
            case "checkbox":
                fields += renderCheckBoxesAndRadioBoxes(f);
                break;
            case "radio":
                fields += renderCheckBoxesAndRadioBoxes(f);
                break;
            case "upload":
                fields += renderUpload(f);
                break;
            case "multi-select":
                fields += renderMultiSelectDropDown(f);
                break;
            case "date":
                fields += renderDatePicker(f);
                break;
            case "text-displayer":
                fields += renderTextDisplayer(f);
                break;
            default:
                fields += renderFields(f);
        }
    });

    return fields;
}

function generateGroups(e) {
    let groups = "";
    if (e.groups) {
        e.groups.forEach(function (f) {
            let cls = f.className || "";
            if (!f.is_visible) {
                cls += " is_hidden";
            }

            let fe = generateFields(f);
            let he = f.heading !== '' ? `<div class="col-sm-12 mt-10" > <h4 class="info_text"> <b>${f.heading}</b></h4></div>` : '';

            groups += '<div class="col-md-12 ' + cls + '">'
                + he
                + fe
                + '</div>';
        });
    }

    return groups;   
}

//Aggregate Matching data;
function sumMatching(array, index) {
    let passed = [];

    //index on which data will be aggregated
    index = index || 1;

    let set = new Set();

    for (let element of array) {
        let data = element[index];
        if (!set.has(data)) {
            let ac = array.filter((s) => {
                return s[index] === data;
            });
            passed.push(ac);
            set.add(data);
        }
    }

    return passed;
}


function generateTables(e) {
    let table = "";

    //generate columns
    let columns = '';

    if (e.table.aggregate === true) {
        columns += '<th></th>';
    }

    e.table.columns.forEach(function (f, v) {
        columns += `<th>${f}</th>`;
    });

    //Add feature button for Terminal table
    if (e.table.type == 'Terminal') {
        columns += '<th></th>';
    }

    //generate rows
    let rows = '';

    let aggregatedData;
    if (e.table.aggregate) {

        //get aggregated data
        aggregatedData = sumMatching(e.table.rows, e.table.aggregate_on_index);

        aggregatedData.forEach(function (f, v) {
            if (f.length > 1) {

                let name = f[0][1];
                let quantity = 0;
                let price = 0;
                let cost = 0;

                //generate random id
                const id = guid();

                let tempRows = '';
                f.forEach((g, v) => {

                    tempRows += '<tr data-ref="' + id + '" class="collapse">';

                    if (e.table.aggregate) {
                        tempRows += '<td></td>';
                    }

                    g.forEach((x, v) => {
                        if (v == 0) {
                            quantity += Number(x);
                        } else if (v == 2) {
                            price += Number(x);
                        } else if (v == 3) {
                            cost += Number(x);
                        }

                        tempRows += `<td>${x}</td>`;
                    });

                    //Assign id to Modal and Modal Toggler
                    const ID = guid();
                    if (e.popup) {
                        e.popup.data[v].id = ID;
                    }

                    if (e.table.type == 'Terminal') {
                        tempRows += `<td><a class="popup-displayer btn btn-success btn-sm btn-feature" data-toggle="modal" data-target="#${ID}" >features</a></td>`;
                    }

                    tempRows += '</tr>';
                });

                let lastTh = e.table.type === 'Terminal' ? '<td colspan="1"></td>' : "";
                rows += `<tr class="custom-collapse expand" data-target="${id}"><td colspan="1"><i class="material-icons">arrow_right</i></td><td colspan="1">${quantity}</td> <td colspan="1">${name}</td> <td colspan="1">${price}</td><td colspan="1">${cost}</td>${lastTh}</tr>` + tempRows;

            } else {

                rows += '<tr class="custom-collapse">';

                if (e.table.aggregate) {
                    rows += '<td></td>';
                }

                f[0].forEach(function (g, v) {
                    rows += `<td>${g}</td>`;
                });

                //Assign id to Modal and Modal Toggler
                const ID = guid();
                if (e.popup) {
                    e.popup.data[v].id = ID;
                }

                //Add feature button for Terminal table
                if (e.table.type == 'Terminal') {
                    rows += `<td><a class="popup-displayer btn btn-success btn-sm btn-feature" data-toggle="modal" data-target="#${ID}">features</a></td>`;
                }

                rows += '</tr>';
            }
        });

    } else {
        aggregatedData = e.table.rows;

        aggregatedData.forEach(function (f, v) {
            rows += '<tr>';

            f.forEach(function (g, v) {
                rows += `<td>${g}</td>`;
            });

            //Assign id to Modal and Modal Toggler
            const ID = guid();
            if (e.popup) {
                e.popup.data[v].id = ID;
            }

            //Add feature button for Terminal table
            if (e.table.type == 'Terminal') {
                rows += `<td><a class="popup-displayer btn btn-success btn-sm btn-feature" data-toggle="modal" data-target="#${ID}">features</a></td>`;
            }

            rows += '</tr>';
        });
    }
    
    

    let cls = e.table.type == 'Terminal' ? 'terminal' : 'non-terminal';

    table += '<div class="col-xs-12 mt-10">'
        + '<h4 class="info_text col-sm-12"><b>'+e.table.heading+'</b></h4>'
        + '<div class="col-sm-12">'
        + '<div class="table-responsive">'
        + '<table class="table table-hover '+cls+'">'
        + '<thead>'
        + '<tr>'
        + columns
        + '</tr>'
        + '</thead>'
        + '<tbody>'
        + rows
        + '</tbody>'
        + '</table>'
        + '</div>'
        + '</div>'
        + '</div>';
    return table;
}

function generateLinks(data) {
    data.tabs.forEach(function (e) {
        $(".wizard-navigation > ul").append('<li><a href="#' + e.name.split(" ").join("-") + '" data-toggle="tab">' + e.name + '</a></li>');
    });
}
