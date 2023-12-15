var map, geojson, featureOverlay, overlays, style, fsButton;
var selected, features, layer_name, layerControl;
var content;
var selectedFeature;


var view = new ol.View({
    projection: 'EPSG:4326',
    center: [82.00, 23.00],
    zoom: 5,

});
var view_ov = new ol.View({
    projection: 'EPSG:4326',
    center: [19.98, 42.90],
    zoom: 7,
});


var base_maps = new ol.layer.Group({
    'title': 'Base maps',
    layers: [
        new ol.layer.Tile({
            title: 'Satellite',
            type: 'base',
            visible: true,
            source: new ol.source.XYZ({
                attributions: ['Powered by Esri',
                    'Source: Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
                ],
                attributionsCollapsible: false,
                url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                maxZoom: 23
            })
        }),
        new ol.layer.Tile({
            title: 'OSM',
            type: 'base',
            visible: true,
            source: new ol.source.OSM()
        })


    ]
});

var OSM = new ol.layer.Tile({
    source: new ol.source.OSM(),
    type: 'base',
    title: 'OSM',
});

overlays = new ol.layer.Group({
    'title': 'Overlays',
    layers: []
});

/*var ind_state = new ol.layer.Image({
            title: 'india_state',
            // extent: [-180, -90, -180, 90],
            source: new ol.source.ImageWMS({
                url: 'http://localhost:8084/geoserver/wms',
                params: {
                    'LAYERS': 'india:india_state'
                },
                ratio: 1,
                serverType: 'geoserver'
            })
        });*/

map = new ol.Map({
    target: 'map',
    view: view,
    // overlays: [overlay]
});


map.addLayer(base_maps);
map.addLayer(overlays);
//overlays.getLayers().push(ind_state);
var popup = new Popup();
map.addOverlay(popup);

var mouse_position = new ol.control.MousePosition();
map.addControl(mouse_position);
var slider = new ol.control.ZoomSlider();
map.addControl(slider);



var zoom_ex = new ol.control.ZoomToExtent({
    extent: [
        65.90, 7.48,
        98.96, 40.30
    ]
});
map.addControl(zoom_ex);

var scale_line = new ol.control.ScaleLine({
    units: 'metric',
    bar: true,
    steps: 6,
    text: true,
    minWidth: 140,
    target: 'scale_bar'
});
map.addControl(scale_line);

layerSwitcher = new ol.control.LayerSwitcher({
    activationMode: 'click',
    startActive: true,
    tipLabel: 'Layers', // Optional label for button
    groupSelectStyle: 'children', // Can be 'children' [default], 'group' or 'none'
    collapseTipLabel: 'Collapse layers',
});
map.addControl(layerSwitcher);

layerSwitcher.renderPanel();

var geocoder = new Geocoder('nominatim', {
    provider: 'osm',
    lang: 'en',
    placeholder: 'Search for ...',
    limit: 5,
    debug: false,
    autoComplete: true,
    keepOpen: true
});
map.addControl(geocoder);

geocoder.on('addresschosen', function(evt) {
    //console.info(evt);
    if (popup) {
        popup.hide();
    }
    window.setTimeout(function() {
        popup.show(evt.coordinate, evt.address.formatted);
    }, 3000);
});



//custom Scale

function scale() {
    var resolution = map.getView().get('resolution');

    var units = map.getView().getProjection().getUnits();

    var dpi = 25.4 / 0.28;
    var mpu = ol.proj.Units.METERS_PER_UNIT[units];
    //alert(resolution);
    var scale = resolution * mpu * 39.37 * dpi;
    //alert(scale);
    if (scale >= 9500 && scale <= 950000) {
        scale = Math.round(scale / 1000) + "K";
    } else if (scale >= 950000) {
        scale = Math.round(scale / 1000000) + "M";
    } else {
        scale = Math.round(scale);
    }
    document.getElementById('scale_bar1').innerHTML = "Scale = 1 : " + scale;
}
scale();

map.getView().on('change:resolution', scale);

document.addEventListener("DOMContentLoaded", function () {
    const fullscreenBtn = document.getElementById("fullscreenBtn");
  
    // Check if fullscreen is supported
    if (document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled) {
      fullscreenBtn.addEventListener("click", toggleFullscreen);
    } else {
      console.log("Fullscreen not supported");
    }
  
    function toggleFullscreen() {
      if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
        // Enter fullscreen mode
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        } else if (document.documentElement.mozRequestFullScreen) {
          document.documentElement.mozRequestFullScreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) {
          document.documentElement.msRequestFullscreen();
        }
      } else {
        // Exit fullscreen mode
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    }
  });
  


//legend
function legend() {

    $('#legend').empty();
    var no_layers = overlays.getLayers().get('length');
    //console.log(no_layers[0].options.layers);
    // console.log(overlays.getLayers().get('length'));
    //var no_layers = overlays.getLayers().get('length');

    var head = document.createElement("h8");

    var txt = document.createTextNode("Legend");

    head.appendChild(txt);
    var element = document.getElementById("legend");
    element.appendChild(head);


    overlays.getLayers().getArray().slice().forEach(layer => {

        var head = document.createElement("p");

        var txt = document.createTextNode(layer.get('title'));
        //alert(txt[i]);
        head.appendChild(txt);
        var element = document.getElementById("legend");
        element.appendChild(head);
        var img = new Image();
        img.src = "http://localhost:8084/geoserver/neturia/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=" + layer.get('title');
        var src = document.getElementById("legend");
        src.appendChild(img);

    });



}

legend();


wfs_capab_store = Ext.create('GeoExt.data.WFSCapabilitiesStore',{
    url: "http://localhost:8084/geoserver/wfs?service=wfs&version=1.0.0&request=getCapabilities",
//	url:"http://localhost:8080/geoserver/wfs?service=wfs&version=1.1.0&request=GetCapabilities",
    autoLoad: true,
     layerOptions: function() {
        return {
            visibility: false,
            displayInLayerSwitcher: false,
            strategies: [new OpenLayers.Strategy.BBOX({ratio: 1})]
        };
    }
    // set as a function that returns a hash of layer options.  This allows
    // to have new objects created upon each new OpenLayers.Layer.Vector
    // object creations.
    
});
wfs_capab_store.load();



wms_capab_store = Ext.create('GeoExt.data.WMSCapabilitiesStore',{
    url: "http://localhost:8084/geoserver/wms?request=getCapabilities",
    autoLoad: true
});
    //wms_capab_store1.load();
    
    
    var menuC = Ext.create('Ext.menu.Menu', {
    //     id: 'contextmenu',
        // itemId: 'contextmenu',
        // xtype: "menu",
        items: [{
            text: "Zoom to Layer Extent",
           // icon: '../images/arrow_out.png',
            handler: function () {
                var snode = tree.getSelectionModel().getSelection();
                var layer1 = snode[0].get('text');
                //alert(layer1);
                
                /*var wms_capab_store1 = Ext.create('GeoExt.data.WMSCapabilitiesStore',{
    url: "http://localhost:8081/geoserver/wms?request=getCapabilities",
    autoLoad: true
});
wms_capab_store1.load();
                var index1 = wms_capab_store1.findExact( 'name', snode[0].get('text'));
                alert(index1);
                var rec = wms_capab_store.getAt(index);
                var extent = rec.get("llbbox");
                map.zoomToExtent(new OpenLayers.Bounds(extent));*/
                //  alert(tree.getSelectionModel().getSelectedNode().layer.name);
                // alert(map.layers[1].name);
                var wms_store = Ext.create('GeoExt.data.WMSCapabilitiesStore',{
    url: "http://localhost:8084/geoserver/wms?request=getCapabilities",
    autoLoad: true,
    listeners : {
    load : function(store) {
           var index = store.findExact( 'title', snode[0].get('text'));
        //alert(index);
        var rec = store.getAt(index);
        var extent = rec.get("llbbox");
        
                    map.zoomToExtent(new OpenLayers.Bounds(extent));
                //	alert(snode.layer.maxExtent);
                
        }
}
});

 },
 scope: this
        },
{
     text: 'Remove Layer',
        handler: function(){
        
        var snode = tree.getSelectionModel().getSelection();
                var layer = snode[0].get('layer');
        //var sel_node_index = sel_node.indexOf(0);
        //alert(sel_node.layer);
        mapPanel.map.removeLayer(layer);
        //alert(sel_node.layer);
          
     }
     }
                ]
    });
    
    
    

var store = Ext.create('Ext.data.TreeStore', {
        model: 'GeoExt.data.LayerTreeModel',
        root: {
            expanded: true,
            children: [
                /*{
                    plugins: [{
                        ptype: 'gx_layercontainer',
                        store: mapPanel.layers
                    }],
                    expanded: true
                }, */
                {
                    plugins: ['gx_overlaylayercontainer'],
                    expanded: true
                }, 
                {
                    plugins: ['gx_baselayercontainer'],
                    expanded: true,
                    text: "Base Maps"
                }
            ]
        }
    });
  //  var layer;
      var tree = Ext.create('GeoExt.tree.Panel', {
        border: true,
        region: "west",
        title: "Layer Panel",
        //width: 250,
        split: true,
        collapsible: true,
       // collapseMode: "mini",
        autoScroll: true,
        store: store,
        rootVisible: false,
        lines: false,
         viewConfig: {
         plugins: [{
                ptype: 'treeviewdragdrop',
                appendOnly: false
            }],
        listeners: {
            itemcontextmenu: function(view, rec, node, index, event) {
                event.stopEvent(); // stops the default event. i.e. Windows Context Menu
                menuC.showAt(event.getXY()); // show context menu where user right clicked
                return false;
            }
        }
    },
         tbar: [{
        text: 'Available Layers',

        handler: function(){
        
        /*var wms_capab_store = Ext.create('GeoExt.data.WmsCapabilitiesLayerStore',{
        id: "wms_capab_store1",
    url: "http://localhost:8081/geoserver/wms?request=getCapabilities",
    autoLoad: true
});
// load the store with records derived from the doc at the above url
wms_capab_store.load();*/
        
       var wms_grid = Ext.create('Ext.grid.GridPanel', {
  //  title: "WMS Capabilities",
   store: wms_capab_store,
   id: "wms_grid",
  // selType: 'cellmodel',
    columns: [
        {header: "Title", dataIndex: "title", sortable: true},
        {header: "Name", dataIndex: "name", sortable: true},
        {header: "Queryable", dataIndex: "queryable", sortable: true, width: 70},
        {id: "description", header: "Description", dataIndex: "abstract"}
    ],

    
viewConfig: {
 //   forceFit: true,

//      Return CSS class to apply to rows depending upon data values
    getRowClass: function(record, index) {
   //    var c = record.get('name');
    //	 if (! c.match(/karan:*/)) {
    //	   return 'none';
    //       }
        
    }
},
    autoExpandColumn: "description",
   // renderTo: "capgrid",
    height: 300,
    width: 650,
    selType: 'rowmodel',
    //sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
     buttons: [{
        text: 'Add to Map',
        handler: function(){
        var record = wms_grid.getSelectionModel().getSelection();
        var layer_name = record[0].get('name');
        var layer_title = record[0].get('title');
        //alert(layer_name);
        //alert(layer_title);
        
            var layer = new OpenLayers.Layer.WMS(
                layer_title, "http://localhost:8084/geoserver/wms",
                {
                    LAYERS: layer_name,
                    STYLES: '',
                    format: 'image/png',
                    tiled: true,
                    transparent: true
                  //  tilesOrigin : map.maxExtent.left + ',' + map.maxExtent.bottom
                },
                {
            //	tileOptions: {maxGetUrlLength: 2048},
                displayInLayerSwitcher: true,
                isBaseLayer: false,
                //singleTile: true,
                transitionEffect: 'resize'
                }
            );
        //var layer = record.getLayer().clone();
        map.addLayer(layer);
        map.zoomToExtent(new OpenLayers.Bounds(record[0].get("llbbox")));
        //alert(layer11);
                
        
        }
        }]
});
        
        if(layer_win)
{layer_win.destroy();}

layer_win=Ext.create('Ext.Window',{
    title: "Layers Library",
           // renderTo: 'container',
    //region: 'north',
   // width:800,
   // height:250,
    items: wms_grid,
    layout:'fit'
  
   
}); 
layer_win.show();
           
          
     }
     }],
     
     bbar: [{
     text: 'Remove Layer',
        handler: function(){
        
        var sel_node = tree.getSelectionModel().getSelection();
        //alert(sel_node);
        var layer = sel_node[0].get('layer');
        //alert(layer);
        //var sel_node_index = sel_node.indexOf(0);
        //alert(sel_node.layer);
        mapPanel.map.removeLayer(layer);
        //alert(sel_node.layer);
                   
          
     }
     }
     
     ]

        
        
    });
    
    /*var layer_store = Ext.create('GeoExt.data.LayerStore', {
    map: map,
//	layers: mapPanel.layers,
    model: 'GeoExt.data.LayerModel',
    autoLoad: true
    });*/
    
    
    var legend_panel = Ext.create('GeoExt.panel.Legend', {
       // border: false,
        region: "west",
        title: "Legend",
        defaults: {
        labelCls: 'mylabel',
        style: 'padding:5px'
    },
       // width: 250,
        //height: 300,
        split: true,
        collapsible: true,
       // collapseMode: "mini",
        autoScroll: true,
        rootVisible: false,
        lines: false,
        //layerStore: layer_store,
        //store: store,
       // rootVisible: false,
       // lines: false,
    });
    

 var layer_combo = Ext.create('Ext.form.ComboBox', {
region: 'east',
    store: wfs_capab_store,
    fieldLabel: 'Layer',
     //renderTo:'container',
    displayField:'title',
    valueField: 'name',
    typeAhead: true,
    mode: 'local',
    forceSelection: true,
    triggerAction: 'all',
    emptyText:'Select_Layer',
    selectOnFocus:true,
    listeners: { 
           select: function(combo, records) {
               // note that records are a array of records to be prepared for multiselection
               // therefore use records[0] to access the selected record
              z = combo.getValue();
            //  alert(z);
            //opacitySlider.setLayer(records.get("layer").params.name);
             //  alert(records.type);
             //  layer1 = new OpenLayers.Layer(z);
            //   alert(layer1.id);
               
               
                               
                    Ext.define('wfs_attributes', {
extend: 'Ext.data.Model',
 fields: [
    { name: 'name', mapping: '@name' },
    { name: 'type', mapping: '@type' }
   
]
});
 var attribute_store = Ext.create('Ext.data.Store', {
model: 'wfs_attributes',
autoLoad: true,
listeners: {
    load: function(){   // This gets executed when your store is done loading.
        console.log('Loaded!!');
    }  
},
proxy: {
    type: 'ajax',
    url : "http://localhost:8084/geoserver/wfs?service=WFS&request=DescribeFeatureType&version=1.1.0&typeName="+z,
    reader: {
        type: 'xml',
        model:'wfs_attributes',
        record: 'xsd\\:element',
        root:'xsd\\:sequence'
    }
},
autoLoad: true,
});
               
             /*    var attribute_store = Ext.create('GeoExt.data.AttributeStore', {
   url: "http://localhost:8081/geoserver/wfs?service=WFS&request=DescribeFeatureType&version=1.1.0&typeName="+z,
   autoLoad: true,
   //autoDestroy: true
  

                 });*/




//attribute_store.filter('name', 'the_geom', true, true);
attribute_combo.bindStore(attribute_store);
//attribute_combo.enable();
attribute_store.load();


     
    //	alert(records.get("layer").params.LAYERS);
        
          
              }
    }
    
});


 
 

  var attribute_combo = Ext.create('Ext.form.ComboBox', {
region: 'east',
//  store: attribute_store,
    fieldLabel: 'attribute',
     //renderTo:'container',
    displayField:'name',
    valueField:'name',
    //disabled: true,
      queryMode: 'local',
    typeAhead: true,
    mode: 'local',
    forceSelection: true,
    triggerAction: 'all',
    emptyText:'Select_Layer',
    selectOnFocus:true,		
    listeners: { 
           select: function(combo, record, index) {
               // note that records are a array of records to be prepared for multiselection
               // therefore use records[0] to access the selected record
            //  z = combo.getValue();
            
              },
              expand: function(combo, record, index) {
               // note that records are a array of records to be prepared for multiselection
               // therefore use records[0] to access the selected record
            //  z = combo.getValue();
            //alert(label_attribute_combo.getStore().filter('name','gid'));
            combo.getStore().filter([
            
            {
fn   : function(record) {
  return record.get('name') != 'the_geom' && record.get('name') != 'geom'
},
scope: this
}
]);
              }
    }
    
});
    var opeartor_store = Ext.create('Ext.data.Store', {
    fields:['name', 'operator'],
    data: [
        {name:'>=', operator:'>='},
        {name:'<=', operator:'<='},
        {name:'=', operator:'='},
        {name:'Like', operator:'ILike'}
        
         ],
         autoLoad: true,
});

//opeartor_store.load();

 var operator_combo = Ext.create('Ext.form.ComboBox', {
region: 'east',
id:'operator_combo',
 store: opeartor_store,
    fieldLabel: 'opeartor',
     //renderTo:'container',
    displayField:'name',
    valueField:'operator',
    //disabled: true,
    typeAhead: true,
    mode: 'local',
    forceSelection: true,
    triggerAction: 'all',
    emptyText:'Select_Layer',
    selectOnFocus:true,
    listeners: { 
           select: function(combo, record, index) {
               // note that records are a array of records to be prepared for multiselection
               // therefore use records[0] to access the selected record
              z = combo.getValue();
            //  alert(z);
            
              }
    }
    
});



    
     var query_panel = Ext.create('Ext.form.FormPanel', {
    title: 'Select Features by Attributes',
    frame: true,
    autoScroll: true,
        border: false,
        //split: true,
        autoScroll: true,
        collapsible: true,
    //labelWidth: 110,
 //  width: 320,
    region:'east',
    //renderTo:'form-ct',
   // bodyStyle: 'padding:0 10px 0;',
    items: [
        layer_combo, attribute_combo, operator_combo,
        {
            xtype: 'textfield',
            id: 'Value',
            fieldLabel: 'Enter Value',
            name: 'Value1'
            //allowBlank:false
        }
    ],
    buttons: [{
        text: 'Query',
        handler: function(){
           if(query_panel.getForm().isValid())
           {
                
var no_fields = query_panel.getComponent(attribute_combo).getStore().getCount();
                    //alert(no_fields);
                    k = no_fields - 1;
                    var field_name = new Array();
                    var field_type = new Array();
                    for (i = 0; i <= k; i++){
                //	alert(record.get('name'));
                //	alert(record.get(combo.valueField));
                    //alert(record.id);
            //  alert(combo.getStore().getRange());
              var tttt = query_panel.getComponent(attribute_combo).getStore().getRange()[i];
            //  alert(tttt);
            //  alert(tttt.get('name'));
              field_name[i] = tttt.get("name");
              field_type[i] = tttt.get("type");
            //  alert(temp[i]);
              
              }
              //alert(field_type);
              
          //  var lk1 = query_panel.getForm().getValues(true);
            //var kk = Ext.getCmp('operator_combo').getValue();
        //	var kk1 = query_panel.getComponent(layer_combo).getStore().getRange();
            var layer_value = query_panel.getComponent(layer_combo).getValue();
            //alert(layer_value);
            
//	var index_layer_combo = query_panel.getComponent(layer_combo).getStore().findExact('title', layer_layer_combo);
            //alert(kk3);
    //		var record_layer_combo = query_panel.getComponent(layer_combo).getStore().getRange()[index_layer_combo];
            //alert(kk4);
    //		var layer_value = record_layer_combo.get("layer").params.LAYERS;
        
            var attribute_value = query_panel.getComponent(attribute_combo).getValue();
            var operator_value = query_panel.getComponent(operator_combo).getValue();
            var text_value = Ext.getCmp('Value').getValue();
            //alert(layer_value);
        //	alert(attribute_value);
        //	alert(operator_value);
        //	alert(text_value);
            select_by_att(field_name,no_fields,field_type,layer_value,attribute_value,operator_value,text_value);
            
    }
     }
   
    },
    
    {
        text: 'Load all Features',
        handler: function(){
         
                               
var no_fields = query_panel.getComponent(attribute_combo).getStore().getCount();
                //	alert(no_fields);
                    k = no_fields - 1;
                    var field_name = new Array();
                    var field_type = new Array();
                    for (i = 0; i <= k; i++){
                //	alert(record.get('name'));
                //	alert(record.get(combo.valueField));
                    //alert(record.id);
            //  alert(combo.getStore().getRange());
              var tttt = query_panel.getComponent(attribute_combo).getStore().getRange()[i];
            //  alert(tttt);
            //  alert(tttt.get('name'));
              field_name[i] = tttt.get("name");
              field_type[i] = tttt.get("type");
            //  alert(temp[i]);
              
              }
        
            var layer_value = query_panel.getComponent(layer_combo).getValue();
    //alert(layer_value);
            select_all(field_name,no_fields,field_type,layer_value);
            
    
     }
   
    }]
});
    
    
    
    
    
    
    
    var north = Ext.create('Ext.panel.Panel', {
            title: "<center>My First Web GIS page</center>",
             region: 'north',
            });
 
 
 south = Ext.create('Ext.panel.Panel', {
    title: "Feature Atributes",
    border: false,
        split: true,
        frame: true,
        autoScroll: true,
   // layout: 'border',
      layout: "fit",
     collapsed: true,
      region: 'south',
    height: 180,
  //  width: 250,
    // frame: true,
    autoScroll: true,
        border: false,
        split: true,
        collapsible: true
    //labelWidth: 110,
  //  items: [tree, legend]
  
});

var west = Ext.create('Ext.Panel', {
    title: "Layers",
   // layout: 'border',
     // layout: "fit",
     collapsed: false,
     collapsible: true,
      region: 'west',
 //   height: 180,
    width: 300,
    // frame: true,
    autoScroll: true,
        border: false,
        split: true,
        //labelWidth: 110,
   items: [tree, legend_panel]
});

var query_editing = Ext.create('Ext.Panel', {
    title: "Feature Query",
   // layout: 'border',
     // layout: "fit",
     collapsed: false,
     collapsible: true,
      region: 'east',
 //   height: 180,
  //  width: 250,
     frame: true,
    autoScroll: true,
        border: false,
        split: true,
        //labelWidth: 110,
   items: [query_panel]
});

viewport = Ext.create('Ext.Viewport', {
        layout: "fit",
        hideBorders: true,
        items: {
            layout: "border",
            deferredRender: false,
            items: [mapPanel, north, west, query_editing, south]
        }
    });
    
    map.zoomToExtent(new OpenLayers.Bounds(
          65.9512481689453, 5.96124982833862,
                101.048751831055, 39.0387496948242
            ));
    
     style = new OpenLayers.StyleMap({
            "default": new OpenLayers.Style(null, {
                rules: [new OpenLayers.Rule({
                    symbolizer: {
                        "Point": {
                            pointRadius: 4,
                           graphicName: "square",
                           fillColor: "blue",
                            fillOpacity: 0.5,
                            strokeWidth: 1,
                            strokeOpacity: 1,
                            strokeColor: "#333333"
                        },
                        "Line": {
                            strokeWidth: 2,
                            strokeOpacity: 1,
                            strokeColor: "#ff9933"
                        },
                        "Polygon": {
                            strokeWidth: 3,
                            strokeOpacity: 1,
                            strokeColor: "#ff6633",
                            fillColor: "blue",
                            fillOpacity: 0
                        }
                    }
                })]
            })
        });
        
        /*map.zoomToExtent(new OpenLayers.Bounds(
          65.9512481689453, 5.96124982833862,
                101.048751831055, 39.0387496948242
            ));*/





function select_by_att(field_name,no_fields,field_type, layer_value, attribute_value, operator_value, text_value)
{
//oooo = map.getLayersBy("name",State_Boundary);
//alert("oooo");



if (vecLayer1)
{
map.removeLayer(vecLayer1);


//south.doLayout(true);
//alert(ww);

//vecLayer1.removeAllFeatures();
///store1.load();
}
if (grid1)
{
grid1.destroy();



}



vecLayer1 = new OpenLayers.Layer.Vector("",{displayInLayerSwitcher: false, styleMap: style});
map.addLayers([vecLayer1]);

fields_name = field_name;
fields_no = no_fields;
fields_type = field_type;	
    


layer_name = layer_value;
attribute_name = attribute_value;
operator_name1 = operator_value;
text_name = text_value;

if (operator_name1 == "ILike")
{
url1 = "http://localhost:8084/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName="+layer_name+"&CQL_FILTER="+attribute_name+"+"+operator_name1+"+'"+text_name+"%25'&outputFormat=application/json"
}
else{
url1 = "http://localhost:8084/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName="+layer_name+"&CQL_FILTER="+attribute_name+"+"+operator_name1+"+'"+text_name+"'&outputFormat=application/json"
}

//alert(layer_name);
//alert(attribute_name);
//alert(operator_name1);
//alert(text_name);


/*keys1 = [];
for (i = 0; i<= fields_no-1; i++)
{
keys1.push(fields_name[i]);
}
alert(keys1);*/



columns1 = [];
keys1 = [];
for (i = 0; i<= fields_no-1; i++)
{

if (fields_type[i] == "xsd:int" || fields_type[i] == "xsd:short" || fields_type[i] == "xsd:long"){var type1 = 'int';var type2 = 'numberfield';}
else if (fields_type[i] == "xsd:string" || fields_type[i] == "xsd:dateTime"){var type1 = 'string';var type2 = 'textfield';}
else if (fields_type[i] == "xsd:double" || fields_type[i] == "xsd:decimal"){var type1 = 'float';var type2 = 'numberfield';}
else {var type1 = "string";var type2 = 'textfield';}
//alert(fields_name[i]);
//alert(fields_type[i]);
//alert(type1);
if(fields_name[i]!= "geom" && fields_name[i]!= "the_geom")
{
keys1.push({
            name: fields_name[i],
            type: type1
        });

columns1.push({
            header: fields_name[i],
            dataIndex: fields_name[i]
            //editor: {xtype: type2}
        });
}


}
//alert(keys1);

//vecLayer1 = new OpenLayers.Layer.Vector("vector");	
//map.addLayers([vecLayer1]);
//map.removeLayer(vecLayer1);

store1 = Ext.create('GeoExt.data.FeatureStore', {
storeId: "store1",
 //  layer: vecLayer1,
    fields: keys1,
    proxy: Ext.create('GeoExt.data.proxy.Protocol',{
        protocol: new OpenLayers.Protocol.HTTP({
        url: url1,
         //   url: "http://localhost:8080/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName="+layer_name+"&CQL_FILTER="+attribute_name+"+"+operator_name1+"+'"+text_name+"'&outputFormat=application/json",
         //  url:"http://localhost:8080/geoserver/karan/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=karan:ind_districts&maxFeatures=50&outputFormat=application/json",
            format: new OpenLayers.Format.GeoJSON()
        }),
        reader: Ext.create('GeoExt.data.reader.Feature')
    }),
    
    autoLoad: true

    //autoDestroy: true
    
});



    store1.bind(vecLayer1);
    
    store1.on("load", function() {mapPanel.map.zoomToExtent(vecLayer1.getDataExtent())});

/*	colModel1 = new Ext.grid.ColumnModel({});
    colModel1.setConfig(keys1, true);
    for (k = 0; k<= fields_no-1; k++){
            
    
//	alert(fields_name[k]);
    colModel1.setColumnHeader(k, fields_name[k]);
    colModel1.setDataIndex(k, fields_name[k]);
    
    
    
    }*/
    
    
// create grid panel configured with feature store
/* gridPanel1 = new Ext.grid.GridPanel({
    title: "Feature Grid1",
    ref: "featureGrid",
    //region: "south",
    //layout: "fit",
    store: store1,
    height: 350,
    collapsible: true,
    autoScroll: true,
    //width: 320,
    colModel:colModel1,
    sm: new GeoExt.grid.FeatureSelectionModel() 
});*/

grid1 = Ext.create('Ext.grid.GridPanel', {
//xtype: "editorgrid",
// ref: "featureGrid",
id: "grid1",
//layout: "fit",
// title: layer_name,
//  region: "south",
// height: 150,
store: store1,
//collapsible: true,
//colModel:colModel1,
columns: columns1,
loadMask: true,
selType: 'featuremodel',
        });
south.add(grid1);
south.doLayout(true);

south.expand(false); 


//vecLayer1.events.register('loadend', vecLayer1, function(evt){mapPanel.map.zoomToExtent(vecLayer1.getDataExtent())});


//gridPanel1.reconfigure(store1, colModel1);
//	store1.bind(vecLayer1);
//gridPanel1.reconfigure(store1, colModel1);
/*if(win)
{win.destroy();}
win=new Ext.Window({
    title: "Attributes",
           // renderTo: 'container',
    //region: 'north',
    width:800,
    height:250,
    items: gridPanel1
   // layout:'table'
}); 

win.show();*/
//	store1.bind(vecLayer1);
//gridPanel1.reconfigure(store1, colModel1);
//gridPanel1.getSelectionModel();

//store1.reload();

//gridPanel1.bindStore(store1);

    //gridPanel1.bindStore(store1);
 




}


function select_all(field_name,no_fields,field_type, layer_value)
{
//oooo = map.getLayersBy("name",State_Boundary);
//alert(oooo);



if (vecLayer1)
{
map.removeLayer(vecLayer1);


//south.doLayout(true);
//alert(ww);

//vecLayer1.removeAllFeatures();
///store1.load();
}
if (grid1)
{
grid1.destroy();



}



vecLayer1 = new OpenLayers.Layer.Vector("",{displayInLayerSwitcher: false, styleMap: style});
map.addLayers([vecLayer1]);

fields_name2 = field_name;
fields_no2 = no_fields;
fields_type2 = field_type;	
    

layer_name2 = layer_value;
//alert(layer_name2);




//alert(layer_name);
//alert(attribute_name);
//alert(operator_name1);
//alert(text_name);


/*keys1 = [];
for (i = 0; i<= fields_no-1; i++)
{
keys1.push(fields_name[i]);
}
alert(keys1);*/



columns1 = [];
keys1 = [];
for (i = 0; i<= fields_no2-1; i++)
{
//alert(fields_type2[i]);
if (fields_type2[i] == "xsd:int" || fields_type2[i] == "xsd:short" || fields_type2[i] == "xsd:long"){var type1 = 'int';var type2 = 'numberfield';}
else if (fields_type2[i] == "xsd:string" || fields_type2[i] == "xsd:dateTime"){var type1 = 'string';var type2 = 'textfield';}
else if (fields_type2[i] == "xsd:double" || fields_type2[i] == "xsd:decimal"){var type1 = 'float';var type2 = 'numberfield';}
else {var type1 = "string";var type2 = 'textfield';}
//alert(fields_name[i]);
//alert(fields_type[i]);
//alert(type1);
if(fields_name2[i]!= "geom" && fields_name2[i]!= "the_geom")
{
keys1.push({
            name: fields_name2[i],
            type: type1
        });

columns1.push({
            header: fields_name2[i],
            dataIndex: fields_name2[i]
            //editor: {xtype: type2}
        });
}


}
//alert(keys1);

//vecLayer1 = new OpenLayers.Layer.Vector("vector");	
//map.addLayers([vecLayer1]);
//map.removeLayer(vecLayer1);

store1 = Ext.create('GeoExt.data.FeatureStore', {
storeId: "store1",
 //  layer: vecLayer1,
    fields: keys1,
    proxy: Ext.create('GeoExt.data.proxy.Protocol',{
        protocol: new OpenLayers.Protocol.HTTP({
        url: "http://localhost:80844/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName="+layer_name2+"&outputFormat=application/json",
         //   url: "http://localhost:8080/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName="+layer_name+"&CQL_FILTER="+attribute_name+"+"+operator_name1+"+'"+text_name+"'&outputFormat=application/json",
         //  url:"http://localhost:8080/geoserver/karan/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=karan:ind_districts&maxFeatures=50&outputFormat=application/json",
            format: new OpenLayers.Format.GeoJSON()
        }),
        reader: Ext.create('GeoExt.data.reader.Feature')
    }),
    
    autoLoad: true

    //autoDestroy: true
    
});



    store1.bind(vecLayer1);
    
    store1.on("load", function() {mapPanel.map.zoomToExtent(vecLayer1.getDataExtent())});
    


grid1 = Ext.create('Ext.grid.GridPanel', {
//xtype: "editorgrid",
// ref: "featureGrid",
id: "grid1",
//layout: "fit",
// title: layer_name,
//  region: "south",
// height: 150,
store: store1,
//collapsible: true,
//colModel:colModel1,
columns: columns1,
loadMask: true,
selType: 'featuremodel',
        });
south.add(grid1);
south.doLayout(true);

south.expand(false); 


 

}

// layer dropdown query
$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "http://localhost:8084/geoserver/wfs?request=getCapabilities",
        dataType: "xml",
        success: function(xml) {
            var select = $('#layer');
            $(xml).find('FeatureType').each(function() {
                //var title = $(this).find('ows:Operation').attr('name');
                //alert(title);
                var name = $(this).find('Name').text();
                //select.append("<option/><option class='ddheader' value='"+ name +"'>"+title+"</option>");
                $(this).find('Name').each(function() {
                    var value = $(this).text();
                    select.append("<option class='ddindent' value='" + value + "'>" + value + "</option>");
                });
            });
            //select.children(":first").text("please make a selection").attr("selected",true);
        }
    });
});


// attribute dropdown		
$(function() {
    $("#layer").change(function() {

        var attributes = document.getElementById("attributes");
        var length = attributes.options.length;
        for (i = length - 1; i >= 0; i--) {
            attributes.options[i] = null;
        }

        var value_layer = $(this).val();


        attributes.options[0] = new Option('Select attributes', "");
        //  alert(url);

        $(document).ready(function() {
            $.ajax({
                type: "GET",
                url: "http://localhost:8084/geoserver/wfs?service=WFS&request=DescribeFeatureType&version=1.1.0&typeName=" + value_layer,
                dataType: "xml",
                success: function(xml) {

                    var select = $('#attributes');
                    //var title = $(xml).find('xsd\\:complexType').attr('name');
                    //	alert(title);
                    $(xml).find('xsd\\:sequence').each(function() {

                        $(this).find('xsd\\:element').each(function() {
                            var value = $(this).attr('name');
                            //alert(value);
                            var type = $(this).attr('type');
                            //alert(type);
                            if (value != 'geom' && value != 'the_geom') {
                                select.append("<option class='ddindent' value='" + type + "'>" + value + "</option>");
                            }
                        });

                    });
                }
            });
        });


    });
});

// operator combo
$(function() {
    $("#attributes").change(function() {

        var operator = document.getElementById("operator");
        var length = operator.options.length;
        for (i = length - 1; i >= 0; i--) {
            operator.options[i] = null;
        }

        var value_type = $(this).val();
        // alert(value_type);
        var value_attribute = $('#attributes option:selected').text();
        operator.options[0] = new Option('Select operator', "");

        if (value_type == 'xsd:short' || value_type == 'xsd:int' || value_type == 'xsd:double' || value_type == 'xsd:long') {
            var operator1 = document.getElementById("operator");
            operator1.options[1] = new Option('Greater than', '>');
            operator1.options[2] = new Option('Less than', '<');
            operator1.options[3] = new Option('Equal to', '=');
            operator1.options[4] = new Option('Between', 'BETWEEN');
        } else if (value_type == 'xsd:string') {
            var operator1 = document.getElementById("operator");
            operator1.options[1] = new Option('Like', 'ILike');

        }

    });
});



// layer dropdown draw query
$(document).ready(function() {
    $.ajax({
        type: "GET",
        url: "http://localhost:8084/geoserver/wfs?request=getCapabilities",
        dataType: "xml",
        success: function(xml) {
            var select = $('#layer1');
            $(xml).find('FeatureType').each(function() {
                //var title = $(this).find('ows:Operation').attr('name');
                //alert(title);
                var name = $(this).find('Name').text();
                //select.append("<option/><option class='ddheader' value='"+ name +"'>"+title+"</option>");
                $(this).find('Name').each(function() {
                    var value = $(this).text();
                    select.append("<option class='ddindent' value='" + value + "'>" + value + "</option>");
                });
            });
            //select.children(":first").text("please make a selection").attr("selected",true);
        }
    });
});


var highlightStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(255,0,0,0.3)',
    }),
    stroke: new ol.style.Stroke({
        color: '#3399CC',
        width: 3,
    }),
    image: new ol.style.Circle({
        radius: 10,
        fill: new ol.style.Fill({
            color: '#3399CC'
        })
    })
});

// function for finding row in the table when feature selected on map
function findRowNumber(cn1, v1) {

    var table = document.querySelector('#table');
    var rows = table.querySelectorAll("tr");
    var msg = "No such row exist"
    for (i = 1; i < rows.length; i++) {
        var tableData = rows[i].querySelectorAll("td");
        if (tableData[cn1 - 1].textContent == v1) {
            msg = i;
            break;
        }
    }
    return msg;
}



// function for loading query

function query() {

    $('#table').empty();
    if (geojson) {
        map.removeLayer(geojson);

    }
    if (selectedFeature) {
        selectedFeature.setStyle();
        selectedFeature = undefined;
    }
	if (vector1) {
        vector1.getSource().clear();
		// $('#table').empty();
    }

    //alert('jsbchdb');	
    var layer = document.getElementById("layer");
    var value_layer = layer.options[layer.selectedIndex].value;
    //alert(value_layer);

    var attribute = document.getElementById("attributes");
    var value_attribute = attribute.options[attribute.selectedIndex].text;
    //alert(value_attribute);

    var operator = document.getElementById("operator");
    var value_operator = operator.options[operator.selectedIndex].value;
    //alert(value_operator);

    var txt = document.getElementById("value");
    var value_txt = txt.value;

    if (value_operator == 'ILike') {
        value_txt = "'" + value_txt + "%25'";
        //alert(value_txt);
        //value_attribute = 'strToLowerCase('+value_attribute+')';
    } else {
        value_txt = value_txt;
        //value_attribute = value_attribute;
    }
    //alert(value_txt);




    var url = "http://localhost:8084/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + value_layer + "&CQL_FILTER=" + value_attribute + "%20" + value_operator + "%20" + value_txt + "&outputFormat=application/json"
    //console.log(url);

    style = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 3
        }),

        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: '#ffcc33'
            })
        })
    });
    geojson = new ol.layer.Vector({
        //title:'dfdfd',
        //title: '<h5>' + value_crop+' '+ value_param +' '+ value_seas+' '+value_level+'</h5>',
        source: new ol.source.Vector({
            url: url,
            format: new ol.format.GeoJSON()
        }),
        style: style,

    });

    geojson.getSource().on('addfeature', function() {
        //alert(geojson.getSource().getExtent());
        map.getView().fit(
            geojson.getSource().getExtent(), {
                duration: 1590,
                size: map.getSize()
            }
        );
    });

    //overlays.getLayers().push(geojson);
    map.addLayer(geojson);

    $.getJSON(url, function(data) {


        var col = [];
        col.push('id');
        for (var i = 0; i < data.features.length; i++) {

            for (var key in data.features[i].properties) {

                if (col.indexOf(key) === -1) {
                    col.push(key);
                }
            }
        }



        var table = document.createElement("table");
        table.setAttribute("class", "table table-hover table-striped");
        table.setAttribute("id", "table");

        var caption = document.createElement("caption");
        caption.setAttribute("id", "caption");
        caption.style.captionSide = 'top';
        caption.innerHTML = value_layer + " (Number of Features : " + data.features.length + " )";
        table.appendChild(caption);



        // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.

        var tr = table.insertRow(-1); // TABLE ROW.

        for (var i = 0; i < col.length; i++) {
            var th = document.createElement("th"); // TABLE HEADER.
            th.innerHTML = col[i];
            tr.appendChild(th);
        }

        // ADD JSON DATA TO THE TABLE AS ROWS.
        for (var i = 0; i < data.features.length; i++) {

            tr = table.insertRow(-1);

            for (var j = 0; j < col.length; j++) {
                var tabCell = tr.insertCell(-1);
                if (j == 0) {
                    tabCell.innerHTML = data.features[i]['id'];
                } else {
                    //alert(data.features[i]['id']);
                    tabCell.innerHTML = data.features[i].properties[col[j]];
                    //alert(tabCell.innerHTML);
                }
            }
        }


        // FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
        var divContainer = document.getElementById("table_data");
        divContainer.innerHTML = "";
        divContainer.appendChild(table);



        document.getElementById('map').style.height = '71%';
        document.getElementById('table_data').style.height = '29%';
        map.updateSize();
        addRowHandlers();

    });
    map.on('singleclick', highlight);



}



// highlight the feature on map and table on map click
function highlight(evt) {

    if (selectedFeature) {
        selectedFeature.setStyle();
        selectedFeature = undefined;
    }

    var feature = map.forEachFeatureAtPixel(evt.pixel,
        function(feature, layer) {
            return feature;
        });

    if (feature && feature.getId() != undefined) {


        var geometry = feature.getGeometry();
        var coord = geometry.getCoordinates();
        var coordinate = evt.coordinate;
        //alert(feature.get('gid'));
        // alert(coordinate);
        /*var content1 = '<h3>' + feature.get([name]) + '</h3>';
        content1 += '<h5>' + feature.get('crop')+' '+ value_param +' '+ value_seas+' '+value_level+'</h5>'
		content1 += '<h5>' + feature.get([value_param]) +' '+ unit +'</h5>';
		
       // alert(content1);
        content.innerHTML = content1;
        overlay.setPosition(coordinate);*/

        // console.info(feature.getProperties());

        $(function() {
            $("#table td").each(function() {
                $(this).parent("tr").css("background-color", "white");
            });
        });
        feature.setStyle(highlightStyle);
        selectedFeature = feature;
        var table = document.getElementById('table');
        var cells = table.getElementsByTagName('td');
        var rows = document.getElementById("table").rows;
        var heads = table.getElementsByTagName('th');
        var col_no;
        for (var i = 0; i < heads.length; i++) {
            // Take each cell
            var head = heads[i];
            //alert(head.innerHTML);
            if (head.innerHTML == 'id') {
                col_no = i + 1;
                //alert(col_no);
            }

        }
        var row_no = findRowNumber(col_no, feature.getId());
        //alert(row_no);

        var rows = document.querySelectorAll('#table tr');

        rows[row_no].scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });

        $(document).ready(function() {
            $("#table td:nth-child(" + col_no + ")").each(function() {

                if ($(this).text() == feature.getId()) {
                    $(this).parent("tr").css("background-color", "grey");

                }
            });
        });
    } else {
        $(function() {
            $("#table td").each(function() {
                $(this).parent("tr").css("background-color", "white");
            });
        });

    }




    /*$(function() {
  $("#table td").each(function() {
    if ($(this).text() == feature.get('gid')) {
     // $(this).css('color', 'red');
	   $(this).parent("tr").css("background-color", "grey");
    }
  });
});*/




};

// highlight the feature on map and table on row select in table
function addRowHandlers() {
    var rows = document.getElementById("table").rows;
    var heads = table.getElementsByTagName('th');
    var col_no;
    for (var i = 0; i < heads.length; i++) {
        // Take each cell
        var head = heads[i];
        //alert(head.innerHTML);
        if (head.innerHTML == 'id') {
            col_no = i + 1;
            //alert(col_no);
        }

    }
    for (i = 0; i < rows.length; i++) {



        rows[i].onclick = function() {
            return function() {
                if (selectedFeature) {
                    selectedFeature.setStyle();
                    selectedFeature = undefined;
                }
                $(function() {
                    $("#table td").each(function() {
                        $(this).parent("tr").css("background-color", "white");
                    });
                });
                var cell = this.cells[col_no - 1];
                var id = cell.innerHTML;


                $(document).ready(function() {
                    $("#table td:nth-child(" + col_no + ")").each(function() {
                        if ($(this).text() == id) {
                            $(this).parent("tr").css("background-color", "grey");
                        }
                    });
                });

                var features = geojson.getSource().getFeatures();

                for (i = 0; i < features.length; i++) {



                    if (features[i].getId() == id) {
                        //alert(features[i].feature.id);
                        features[i].setStyle(highlightStyle);
                        selectedFeature = features[i];
                        var featureExtent = features[i].getGeometry().getExtent();
                        if (featureExtent) {
                            map.getView().fit(featureExtent, {
                                duration: 1590,
                                size: map.getSize()
                            });
                        }

                    }
                }

                //alert("id:" + id);
            };
        }(rows[i]);
    }
}

//list of wms_layers_ in window on click of button

function wms_layers() {

    $(function() {

        $("#wms_layers_window").modal({
            backdrop: false
        });
        $("#wms_layers_window").draggable();
        $("#wms_layers_window").modal('show');

    });

    $(document).ready(function() {
        $.ajax({
            type: "GET",
            url: "http://localhost:8084/geoserver/neturia/wms?request=getCapabilities",
            dataType: "xml",
            success: function(xml) {
                $('#table_wms_layers').empty();
                // console.log("here");
                $('<tr></tr>').html('<th>Name</th><th>Title</th><th>Abstract</th>').appendTo('#table_wms_layers');
                $(xml).find('Layer').find('Layer').each(function() {
                    var name = $(this).children('Name').text();
                    // alert(name);
                    //var name1 = name.find('Name').text();
                    //alert(name);
                    var title = $(this).children('Title').text();

                    var abst = $(this).children('Abstract').text();
                    //   alert(abst);


                    //   alert('test');
                    $('<tr></tr>').html('<td>' + name + '</td><td>' + title + '</td><td>' + abst + '</td>').appendTo('#table_wms_layers');
                    //document.getElementById("table_wms_layers").setAttribute("class", "table-success");

                });
                addRowHandlers1();
            }
        });
    });




    function addRowHandlers1() {
        //alert('knd');
        var rows = document.getElementById("table_wms_layers").rows;
        var table = document.getElementById('table_wms_layers');
        var heads = table.getElementsByTagName('th');
        var col_no;
        for (var i = 0; i < heads.length; i++) {
            // Take each cell
            var head = heads[i];
            //alert(head.innerHTML);
            if (head.innerHTML == 'Name') {
                col_no = i + 1;
                //alert(col_no);
            }

        }
        for (i = 0; i < rows.length; i++) {

            rows[i].onclick = function() {
                return function() {

                    $(function() {
                        $("#table_wms_layers td").each(function() {
                            $(this).parent("tr").css("background-color", "white");
                        });
                    });
                    var cell = this.cells[col_no - 1];
                    layer_name = cell.innerHTML;
                    // alert(layer_name);

                    $(document).ready(function() {
                        $("#table_wms_layers td:nth-child(" + col_no + ")").each(function() {
                            if ($(this).text() == layer_name) {
                                $(this).parent("tr").css("background-color", "grey");



                            }
                        });
                    });

                    //alert("id:" + id);
                };
            }(rows[i]);
        }

    }

}
// add wms layer to map on click of button
function add_layer() {
    //	alert("jd"); 

    // alert(layer_name);
    //map.removeControl(layerSwitcher);

    var name = layer_name.split(":");
    //alert(layer_name);
    var layer_wms = new ol.layer.Image({
        title: layer_name,
        // extent: [-180, -90, -180, 90],
        source: new ol.source.ImageWMS({
            url: 'http://localhost:8084/geoserver/neturia/wms',
            params: {
                'LAYERS': layer_name
            },
            ratio: 1,
            serverType: 'geoserver'
        })
    });
    overlays.getLayers().push(layer_wms);

    var url = 'http://localhost:8084/geoserver/neturia/wms?request=getCapabilities';
    var parser = new ol.format.WMSCapabilities();


    $.ajax(url).then(function(response) {
        //window.alert("word");
        var result = parser.read(response);
        // console.log(result);
        // window.alert(result);
        var Layers = result.Capability.Layer.Layer;
        var extent;
        for (var i = 0, len = Layers.length; i < len; i++) {

            var layerobj = Layers[i];
            //  window.alert(layerobj.Name);

            if (layerobj.Name == layer_name) {
                extent = layerobj.BoundingBox[0].extent;
                //alert(extent);
                map.getView().fit(
                    extent, {
                        duration: 1590,
                        size: map.getSize()
                    }
                );

            }
        }
    });


    layerSwitcher.renderPanel();
    legend();

}

function close_wms_window() {
    layer_name = undefined;
}
// function on click of getinfo
function info() {
    if (document.getElementById("info_btn").innerHTML == "☰ Activate GetInfo") {

        document.getElementById("info_btn").innerHTML = "☰ De-Activate GetInfo";
        document.getElementById("info_btn").setAttribute("class", "btn btn-danger btn-sm");
        map.on('singleclick', getinfo);
    } else {

        map.un('singleclick', getinfo);
        document.getElementById("info_btn").innerHTML = "☰ Activate GetInfo";
        document.getElementById("info_btn").setAttribute("class", "btn btn-success btn-sm");
        if (popup) {
            popup.hide();
        }
    }
}

// getinfo function
function getinfo(evt) {

    var coordinate = evt.coordinate;
    var viewResolution = /** @type {number} */ (view.getResolution());


    if (popup) {
        popup.hide();
    }
    if (content) {
        content = '';
    }
    overlays.getLayers().getArray().slice().forEach(layer => {
        var visibility = layer.getVisible();
        console.log(visibility);
        if (visibility == true) {

            var layer_title = layer.get('title');
            var wmsSource = new ol.source.ImageWMS({
                url: 'http://localhost:8084/geoserver/neturia/wms',
                params: {
                    'LAYERS': layer_title
                },
                serverType: 'geoserver',
                crossOrigin: 'anonymous'
            });

            var url = wmsSource.getFeatureInfoUrl(
                evt.coordinate, viewResolution, 'EPSG:4326', {
                    'INFO_FORMAT': 'text/html'
                });
            // alert(url[i]);
            //console.log(url);

            //assuming you use jquery
            $.get(url, function(data) {

                // $("#popup-content").append(data);
                //document.getElementById('popup-content').innerHTML = '<p>Feature Info</p><code>' + data + '</code>';
                content += data;
                // overlay.setPosition(coordinate);
                popup.show(evt.coordinate, content);


            });
        }

    });

}




// clear function
function clear_all() {
    if (vector1) {
        vector1.getSource().clear();
        //map.removeLayer(geojson);
    }

    if (draw1) {
        map.removeInteraction(draw1);
    }
    document.getElementById('map').style.height = '100%';
    document.getElementById('table_data').style.height = '0%';
    map.updateSize();
    $('#table').empty();
    $('#legend').empty();
    if (geojson) {
        geojson.getSource().clear();
        map.removeLayer(geojson);
    }

    if (selectedFeature) {
        selectedFeature.setStyle();
        selectedFeature = undefined;
    }
    if (popup) {
        popup.hide();
    }
    map.getView().fit([65.90, 7.48, 98.96, 40.30], {
        duration: 1590,
        size: map.getSize()
    });


    document.getElementById("query_panel_btn").innerHTML = "☰ Open Query Panel";
    document.getElementById("query_panel_btn").setAttribute("class", "btn btn-success btn-sm");

    document.getElementById("query_tab").style.width = "0%";
    document.getElementById("map").style.width = "100%";
    document.getElementById("map").style.left = "0%";
    document.getElementById("query_tab").style.visibility = "hidden";
    document.getElementById('table_data').style.left = '0%';

    document.getElementById("legend_btn").innerHTML = "☰ Show Legend";
    document.getElementById("legend").style.width = "0%";
    document.getElementById("legend").style.visibility = "hidden";
    document.getElementById('legend').style.height = '0%';

    map.un('singleclick', getinfo);
    map.un('singleclick', highlight);
    document.getElementById("info_btn").innerHTML = "☰ Activate GetInfo";
    document.getElementById("info_btn").setAttribute("class", "btn btn-success btn-sm");
    map.updateSize();



    overlays.getLayers().getArray().slice().forEach(layer => {

        overlays.getLayers().remove(layer);

    });

    layerSwitcher.renderPanel();

    if (draw) {
        map.removeInteraction(draw)
    };
    if (vectorLayer) {
        vectorLayer.getSource().clear();
    }
    map.removeOverlay(helpTooltip);

    if (measureTooltipElement) {
        var elem = document.getElementsByClassName("tooltip tooltip-static");
        //$('#measure_tool').empty(); 

        //alert(elem.length);
        for (var i = elem.length - 1; i >= 0; i--) {

            elem[i].remove();
            //alert(elem[i].innerHTML);
        }
    }



}



function show_hide_querypanel() {

    if (document.getElementById("query_tab").style.visibility == "hidden") {

        document.getElementById("query_panel_btn").innerHTML = "☰ Hide Query Panel";
        document.getElementById("query_panel_btn").setAttribute("class", "btn btn-danger btn-sm");
        document.getElementById("query_tab").style.visibility = "visible";
        document.getElementById("query_tab").style.width = "21%";
        document.getElementById("map").style.width = "79%";
        document.getElementById("map").style.left = "21%";

        document.getElementById('table_data').style.left = '21%';
        map.updateSize();
    } else {
        document.getElementById("query_panel_btn").innerHTML = "☰ Open Query Panel";
        document.getElementById("query_panel_btn").setAttribute("class", "btn btn-success btn-sm");
        document.getElementById("query_tab").style.width = "0%";
        document.getElementById("map").style.width = "100%";
        document.getElementById("map").style.left = "0%";
        document.getElementById("query_tab").style.visibility = "hidden";
        document.getElementById('table_data').style.left = '0%';

        map.updateSize();
    }
}

function show_hide_legend() {

    if (document.getElementById("legend").style.visibility == "hidden") {

        document.getElementById("legend_btn").innerHTML = "☰ Hide Legend";
		document.getElementById("legend_btn").setAttribute("class", "btn btn-danger btn-sm");

        document.getElementById("legend").style.visibility = "visible";
        document.getElementById("legend").style.width = "15%";

        document.getElementById('legend').style.height = '38%';
        map.updateSize();
    } else {
	    document.getElementById("legend_btn").setAttribute("class", "btn btn-success btn-sm");
        document.getElementById("legend_btn").innerHTML = "☰ Show Legend";
        document.getElementById("legend").style.width = "0%";
        document.getElementById("legend").style.visibility = "hidden";
        document.getElementById('legend').style.height = '0%';

        map.updateSize();
    }
}



draw_type.onchange = function() {

    map.removeInteraction(draw1);

    if (draw) {
        map.removeInteraction(draw);
        map.removeOverlay(helpTooltip);
        map.removeOverlay(measureTooltip);
    }
    if (vectorLayer) {
        vectorLayer.getSource().clear();
    }
    if (vector1) {
        vector1.getSource().clear();
		// $('#table').empty();
    }
	

    if (measureTooltipElement) {
        var elem = document.getElementsByClassName("tooltip tooltip-static");
        //$('#measure_tool').empty(); 

        //alert(elem.length);
        for (var i = elem.length - 1; i >= 0; i--) {

            elem[i].remove();
            //alert(elem[i].innerHTML);
        }
    }

    add_draw_Interaction();
};


var source1 = new ol.source.Vector({
    wrapX: false
});

var vector1 = new ol.layer.Vector({
    source: source1
});
map.addLayer(vector1);

var draw1;



// measure Tool
function add_draw_Interaction() {
    var value = draw_type.value;
    //alert(value);
    if (value !== 'None') {
        var geometryFunction;
        if (value === 'Square') {
            value = 'Circle';
            geometryFunction = new ol.interaction.Draw.createRegularPolygon(4);

        } else if (value === 'Box') {
            value = 'Circle';

            geometryFunction = new ol.interaction.Draw.createBox();

        } else if (value === 'Star') {
            value = 'Circle';
            geometryFunction = function(coordinates, geometry) {
                //alert(value);
                var center = coordinates[0];
                var last = coordinates[1];
                var dx = center[0] - last[0];
                var dy = center[1] - last[1];
                var radius = Math.sqrt(dx * dx + dy * dy);
                var rotation = Math.atan2(dy, dx);
                var newCoordinates = [];
                var numPoints = 12;
                for (var i = 0; i < numPoints; ++i) {
                    var angle = rotation + i * 2 * Math.PI / numPoints;
                    var fraction = i % 2 === 0 ? 1 : 0.5;
                    var offsetX = radius * fraction * Math.cos(angle);
                    var offsetY = radius * fraction * Math.sin(angle);
                    newCoordinates.push([center[0] + offsetX, center[1] + offsetY]);
                }
                newCoordinates.push(newCoordinates[0].slice());
                if (!geometry) {
                    geometry = new ol.geom.Polygon([newCoordinates]);
                } else {
                    geometry.setCoordinates([newCoordinates]);
                }
                return geometry;
            };
        }
        
        // map.addInteraction(draw1);

        if (draw_type.value == 'select' || draw_type.value == 'clear') {

            if(draw1){map.removeInteraction(draw1);}
            vector1.getSource().clear();
            if (geojson) {
                geojson.getSource().clear();
                map.removeLayer(geojson);
            }

        } else if (draw_type.value == 'Square' || draw_type.value == 'Polygon' || draw_type.value == 'Circle' || draw_type.value == 'Star' || draw_type.value == 'Box')

        {
		draw1 = new ol.interaction.Draw({
            source: source1,
            type: value,
            geometryFunction: geometryFunction
        });

            map.addInteraction(draw1);

            draw1.on('drawstart', function(evt) {
                if (vector1) {
                    vector1.getSource().clear();
                }
                if (geojson) {
                    geojson.getSource().clear();
                    map.removeLayer(geojson);
                }

                //alert('bc');

            });

            draw1.on('drawend', function(evt) {
                var feature = evt.feature;

                var coords = feature.getGeometry();
                //console.log(coords);
                var format = new ol.format.WKT();
                var wkt = format.writeGeometry(coords);

                var layer_name = document.getElementById("layer1");
                var value_layer = layer_name.options[layer_name.selectedIndex].value;

                var url = "http://localhost:8084/geoserver/wfs?request=GetFeature&version=1.0.0&typeName=" + value_layer + "&outputFormat=json&cql_filter=INTERSECTS(the_geom," + wkt + ")";
                //alert(url);


                style = new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.2)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#ffcc33',
                        width: 3
                    }),

                    image: new ol.style.Circle({
                        radius: 7,
                        fill: new ol.style.Fill({
                            color: '#ffcc33'
                        })
                    })
                });

                geojson = new ol.layer.Vector({
                    //title:'dfdfd',
                    //title: '<h5>' + value_crop+' '+ value_param +' '+ value_seas+' '+value_level+'</h5>',
                    source: new ol.source.Vector({
                        url: url,
                        format: new ol.format.GeoJSON()
                    }),
                    style: style,

                });

                geojson.getSource().on('addfeature', function() {
                    //alert(geojson.getSource().getExtent());
                    map.getView().fit(
                        geojson.getSource().getExtent(), {
                            duration: 1590,
                            size: map.getSize()
                        }
                    );
                });

                //overlays.getLayers().push(geojson);
                map.addLayer(geojson);
                map.removeInteraction(draw1);
                $.getJSON(url, function(data) {


                    var col = [];
                    col.push('id');
                    for (var i = 0; i < data.features.length; i++) {

                        for (var key in data.features[i].properties) {

                            if (col.indexOf(key) === -1) {
                                col.push(key);
                            }
                        }
                    }



                    var table = document.createElement("table");
                    table.setAttribute("class", "table table-hover table-striped");
                    table.setAttribute("id", "table");

                    var caption = document.createElement("caption");
                    caption.setAttribute("id", "caption");
                    caption.style.captionSide = 'top';
                    caption.innerHTML = value_layer + " (Number of Features : " + data.features.length + " )";
                    table.appendChild(caption);



                    // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.

                    var tr = table.insertRow(-1); // TABLE ROW.

                    for (var i = 0; i < col.length; i++) {
                        var th = document.createElement("th"); // TABLE HEADER.
                        th.innerHTML = col[i];
                        tr.appendChild(th);
                    }

                    // ADD JSON DATA TO THE TABLE AS ROWS.
                    for (var i = 0; i < data.features.length; i++) {

                        tr = table.insertRow(-1);

                        for (var j = 0; j < col.length; j++) {
                            var tabCell = tr.insertCell(-1);
                            if (j == 0) {
                                tabCell.innerHTML = data.features[i]['id'];
                            } else {
                                //alert(data.features[i]['id']);
                                tabCell.innerHTML = data.features[i].properties[col[j]];
                                //alert(tabCell.innerHTML);
                            }
                        }
                    }


                    // FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
                    var divContainer = document.getElementById("table_data");
                    divContainer.innerHTML = "";
                    divContainer.appendChild(table);



                    document.getElementById('map').style.height = '71%';
                    document.getElementById('table_data').style.height = '29%';
                    map.updateSize();
                    addRowHandlers();

                });
                map.on('singleclick', highlight);

            });


        }


    }
}


//measuretype change
/**
 * Let user change the geometry type.
 */
measuretype.onchange = function() {



    map.un('singleclick', getinfo);
    document.getElementById("info_btn").innerHTML = "☰ Activate GetInfo";
    document.getElementById("info_btn").setAttribute("class", "btn btn-success btn-sm");
    if (popup) {
        popup.hide();
    }
    map.removeInteraction(draw);
    addInteraction();
};


var source = new ol.source.Vector();
var vectorLayer = new ol.layer.Vector({
    //title: 'layer',
    source: source,
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 2
        }),
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: '#ffcc33'
            })
        })
    })
});

map.addLayer(vectorLayer);




/**
 * Currently drawn feature.
 * @type {module:ol/Feature~Feature}
 */
var sketch;


/**
 * The help tooltip element.
 * @type {Element}
 */
var helpTooltipElement;


/**
 * Overlay to show the help messages.
 * @type {module:ol/Overlay}
 */
var helpTooltip;


/**
 * The measure tooltip element.
 * @type {Element}
 */
var measureTooltipElement;


/**
 * Overlay to show the measurement.
 * @type {module:ol/Overlay}
 */
var measureTooltip;


/**
 * Message to show when the user is drawing a polygon.
 * @type {string}
 */
var continuePolygonMsg = 'Click to continue drawing the polygon';


/**
 * Message to show when the user is drawing a line.
 * @type {string}
 */
var continueLineMsg = 'Click to continue drawing the line';




//var measuretype = document.getElementById('measuretype');

var draw; // global so we can remove it later


/**
 * Format length output.
 * @param {module:ol/geom/LineString~LineString} line The line.
 * @return {string} The formatted length.
 */
var formatLength = function(line) {
    var length = ol.sphere.getLength(line, {
        projection: 'EPSG:4326'
    });
    //var length = getLength(line);
    //var length = line.getLength({projection:'EPSG:4326'});

    var output;
    if (length > 100) {
        output = (Math.round(length / 1000 * 100) / 100) +
            ' ' + 'km';

    } else {
        output = (Math.round(length * 100) / 100) +
            ' ' + 'm';

    }
    return output;

};


/**
 * Format area output.
 * @param {module:ol/geom/Polygon~Polygon} polygon The polygon.
 * @return {string}// Formatted area.
 */
var formatArea = function(polygon) {
    // var area = getArea(polygon);
    var area = ol.sphere.getArea(polygon, {
        projection: 'EPSG:4326'
    });
    // var area = polygon.getArea();
    //alert(area);
    var output;
    if (area > 10000) {
        output = (Math.round(area / 1000000 * 100) / 100) +
            ' ' + 'km<sup>2</sup>';
    } else {
        output = (Math.round(area * 100) / 100) +
            ' ' + 'm<sup>2</sup>';
    }
    return output;
};

function addInteraction() {




    if (measuretype.value == 'select' || measuretype.value == 'clear') {

        if (draw) {
            map.removeInteraction(draw)
        };
        if (vectorLayer) {
            vectorLayer.getSource().clear();
        }
        if (helpTooltip) {
            map.removeOverlay(helpTooltip);
        }

        if (measureTooltipElement) {
            var elem = document.getElementsByClassName("tooltip tooltip-static");
            //$('#measure_tool').empty(); 

            //alert(elem.length);
            for (var i = elem.length - 1; i >= 0; i--) {

                elem[i].remove();
                //alert(elem[i].innerHTML);
            }
        }

        //var elem1 = elem[0].innerHTML;
        //alert(elem1);

    } else if (measuretype.value == 'area' || measuretype.value == 'length') {
        var type;
        if (measuretype.value == 'area') {
            type = 'Polygon';
        } else if (measuretype.value == 'length') {
            type = 'LineString';
        }
        //alert(type);

        //var type = (measuretype.value == 'area' ? 'Polygon' : 'LineString');
        draw = new ol.interaction.Draw({
            source: source,
            type: type,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.5)'
                }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0, 0.5)',
                    lineDash: [10, 10],
                    width: 2
                }),
                image: new ol.style.Circle({
                    radius: 5,
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0, 0, 0, 0.7)'
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.5)'
                    })
                })
            })
        });
        map.addInteraction(draw);
        createMeasureTooltip();
        createHelpTooltip();
        /**
         * Handle pointer move.
         * @param {module:ol/MapBrowserEvent~MapBrowserEvent} evt The event.
         */
        var pointerMoveHandler = function(evt) {
            if (evt.dragging) {
                return;
            }
            /** @type {string} */
            var helpMsg = 'Click to start drawing';

            if (sketch) {
                var geom = (sketch.getGeometry());
                if (geom instanceof ol.geom.Polygon) {

                    helpMsg = continuePolygonMsg;
                } else if (geom instanceof ol.geom.LineString) {
                    helpMsg = continueLineMsg;
                }
            }

            helpTooltipElement.innerHTML = helpMsg;
            helpTooltip.setPosition(evt.coordinate);

            helpTooltipElement.classList.remove('hidden');
        };

        map.on('pointermove', pointerMoveHandler);

        map.getViewport().addEventListener('mouseout', function() {
            helpTooltipElement.classList.add('hidden');
        });


        var listener;
        draw.on('drawstart',
            function(evt) {
                // set sketch


                //vectorLayer.getSource().clear();

                sketch = evt.feature;

                /** @type {module:ol/coordinate~Coordinate|undefined} */
                var tooltipCoord = evt.coordinate;

                listener = sketch.getGeometry().on('change', function(evt) {
                    var geom = evt.target;

                    var output;
                    if (geom instanceof ol.geom.Polygon) {

                        output = formatArea(geom);
                        tooltipCoord = geom.getInteriorPoint().getCoordinates();

                    } else if (geom instanceof ol.geom.LineString) {

                        output = formatLength(geom);
                        tooltipCoord = geom.getLastCoordinate();
                    }
                    measureTooltipElement.innerHTML = output;
                    measureTooltip.setPosition(tooltipCoord);
                });
            }, this);

        draw.on('drawend',
            function() {
                measureTooltipElement.className = 'tooltip tooltip-static';
                measureTooltip.setOffset([0, -7]);
                // unset sketch
                sketch = null;
                // unset tooltip so that a new one can be created
                measureTooltipElement = null;
                createMeasureTooltip();
                ol.Observable.unByKey(listener);
            }, this);

    }
}


/**
 * Creates a new help tooltip
 */
function createHelpTooltip() {
    if (helpTooltipElement) {
        helpTooltipElement.parentNode.removeChild(helpTooltipElement);
    }
    helpTooltipElement = document.createElement('div');
    helpTooltipElement.className = 'tooltip hidden';
    helpTooltip = new ol.Overlay({
        element: helpTooltipElement,
        offset: [15, 0],
        positioning: 'center-left'
    });
    map.addOverlay(helpTooltip);
}


/**
 * Creates a new measure tooltip
 */
function createMeasureTooltip() {
    if (measureTooltipElement) {
        measureTooltipElement.parentNode.removeChild(measureTooltipElement);
    }
    measureTooltipElement = document.createElement('div');
    measureTooltipElement.className = 'tooltip tooltip-measure';

    measureTooltip = new ol.Overlay({
        element: measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center'
    });
    map.addOverlay(measureTooltip);

}


