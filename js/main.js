const app = Vue.createApp(
    {
        data() {
            return {
                map: null,
                mapView: null,
                mapEpsg: 'EPSG:3857',
                baseLayers: [],
                dataLayers: [],
                selectDataTableLayerName: '',
                currentDeviceGeolocationCoordinates: undefined,
                geolocationCoordinates: undefined,
                popupElement: undefined,
                popupOverlay: undefined,
                popover: undefined,
                sortableLayerlist: undefined,
                currentfeatureProperties: undefined,
            }
        },
        async beforeCreate() {
            console.log('app beforeCreate');
        },
        async created() {
            console.log('app created');
        },
        async beforeMount() {
            console.log('app beforeMount');
        },
        async mounted() {
            console.log('app mounted');
            let self = this;
            await self.initLaunchHandler();
            await self.initDomEvent();
            await self.initMap();

        },
        async beforeUpdate() {
            console.log('app beforeUpdate');
        },
        async updated() {
            console.log('app updated');
        },
        async beforeUnmount() {
            console.log('app beforeUnmount');
        },
        unmounted() {
            console.log('app unmounted');
        },
        methods: {
            async initLaunchHandler() {
                let self = this;
                if ('launchQueue' in window) {
                    console.log('File handling API is supported!');
                    launchQueue.setConsumer(async (launchParams) => {
                        if (!launchParams.files.length) {
                            return;
                        }
                        await self.handleFileLaunch(launchParams.files[0]);
                    });
                } else {
                    console.error('File handling API is not supported!');
                }
            },
            async initMap() {
                let self = this;
                const googleMapWebGLTile = await layerGenerator.creatXYZLayerFromUrl(
                    'googleMap',
                    'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
                )
                const osmWebGLTile = await layerGenerator.creatXYZLayerFromUrl(
                    'OSM',
                    'http://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                )
                const nlscWmsEmap = await layerGenerator.creatWMSLayerFromUrl(
                    'nlscEmap',
                    'https://wms.nlsc.gov.tw/wms'
                    , 'EMAP'
                )
                const nlscWMTSEmap = await layerGenerator.creatWMTSLayerFromUrl(
                    'nlscEmap',
                    'https://wmts.nlsc.gov.tw/wmts'
                    , 'EMAP'
                )
                self.baseLayers.push(osmWebGLTile);
                self.mapView = new ol.View({
                    projection: self.mapEpsg,
                    center: [0, 0],
                    zoom: 2,
                })
                self.map = new ol.Map({
                    target: 'map_canvas',
                    layers: self.baseLayers,
                    view: self.mapView,
                });
                self.popupElement = document.getElementById('popup');

                self.popupOverlay = new ol.Overlay({
                    element: self.popupElement,
                    positioning: 'bottom-center',
                    stopEvent: false,
                });
                self.map.addOverlay(self.popupOverlay);
                //, 'pointermove',singleclick,click
                self.map.on(['singleclick'], function (evt) {
                    console.log(evt);
                    const coordinate = evt.coordinate;
                    const feature = self.map.forEachFeatureAtPixel(evt.pixel, function (feature) {
                        return feature;
                    });
                    self.disposePopover();
                    console.log(feature);
                    if (!feature) {
                        self.currentfeatureProperties = null;
                        return;
                    }
                    self.currentfeatureProperties = feature.getProperties();
                    self.popFeature(self.currentfeatureProperties, evt.coordinate);
                });
                self.currentDeviceGeolocationCoordinates = new ol.Geolocation({
                    trackingOptions: {
                        enableHighAccuracy: true,
                    },
                    projection: self.mapView.getProjection(),
                });

                self.currentDeviceGeolocationCoordinates.setTracking(true);

                self.currentDeviceGeolocationCoordinates.on('change', function () {
                    let accuracy = self.currentDeviceGeolocationCoordinates.getAccuracy();
                    let ccuracyGeometry = self.currentDeviceGeolocationCoordinates.getAccuracyGeometry();
                    let altitude = self.currentDeviceGeolocationCoordinates.getAltitude();
                    let altitudeAccuracy = self.currentDeviceGeolocationCoordinates.getAltitudeAccuracy();
                    let heading = self.currentDeviceGeolocationCoordinates.getHeading();
                    let position = self.currentDeviceGeolocationCoordinates.getPosition();
                    let projection = self.currentDeviceGeolocationCoordinates.getProjection();
                    let speed = self.currentDeviceGeolocationCoordinates.getSpeed();
                    const geolocationCoordinates = {
                        accuracy: accuracy,
                        ccuracyGeometry: ccuracyGeometry,
                        altitude: altitude,
                        altitudeAccuracy: altitudeAccuracy,
                        heading: heading,
                        position: position,
                        projection: projection,
                        speed: speed,
                    }
                    console.log(geolocationCoordinates);
                    self.geolocationCoordinates = geolocationCoordinates;
                });
                self.currentDeviceGeolocationCoordinates.on('error', function (error) {
                    console.error(error);
                });
            },
            disposePopover() {
                let self = this;
                if (self.popover) {
                    self.popover.dispose();
                    self.popupOverlay.setPosition(undefined);
                    self.currentfeatureProperties = null;
                    self.popover = undefined;
                }
            },
            async initDomEvent() {
                let self = this;

                let layerlistEl = document.getElementById('layerlist');
                let fileElem = document.getElementById('inputfile');
                let maparea = document.getElementById("map_canvas");

                $('.page').on('click', '.dataTable, .btn-dataTable-close', function () {
                    var half = $(window).height() / 2;
                    var full = $(window).height() - 60;
                    if ($('#offcanvasBottom').hasClass("show")) {
                        $('#map_canvas').animate({ height: full }, 160);
                    } else {
                        $('#map_canvas').animate({ height: half }, 300);
                    }
                });

                $('.page').on('click', '.addlayer', function () {
                    var full = $(window).height() - 60;
                    $('#map_canvas').animate({ height: full }, 160);
                });

                $("#offcanvasBottom").resizable({
                    handleSelector: ".splitter-horizontal",
                    resizeWidth: false,
                });

                $(window).resize(function () {
                    if ($('#offcanvasBottom').hasClass("show")) {
                        $('#map_canvas').css("height", "50%");
                    } else {
                        $('#map_canvas').css("height", "100% - 60px");
                    }
                });

                self.sortableLayerlist = Sortable.create(layerlistEl, {
                    dataIdAttr: 'data-layerName',
                    onEnd: function (evt) {
                        self.changLayerZindex(self.sortableLayerlist.toArray())
                    }
                });

                fileElem.addEventListener('change', async (evt) => await self.handleFileSelect(evt));

                maparea.addEventListener("dragover", self.FileDragHover, false);
                maparea.addEventListener("dragleave", self.FileDragHover, false);
                maparea.addEventListener("drop", self.FileSelectHandler, false);

                $(document).on('click','.popover-close',function(){
                    self.disposePopover();
                });

            },
            async FileDragHover(e) {
                e.stopPropagation();
                e.preventDefault();
                e.target.className = (e.type == "dragover" ? "hover" : "");
            },
            async FileSelectHandler(e) {
                let self = this;
                self.FileDragHover(e);
                var files = e.target.files || e.dataTransfer.files;
                if (files.length > 0) {
                    for (const file of files) {
                        await self.handleFile(file);
                    }
                }
            },
            async addLayerToMap(layer) {
                let self = this;
                self.map.addLayer(layer);
            },
            async zoomToLayer(layer) {
                let self = this;
                let source = layer.getSource();
                self.map.getView().fit(source.getExtent(), self.map.getSize());
            },
            async handleFileSelect(evt) {
                let self = this;
                let fileElem = document.getElementById('inputfile');

                let files = evt.target.files;
                if (files.length > 0) {
                    for (const file of files) {
                        await self.handleFile(file);
                    }
                }
                fileElem.value = "";
            },
            async handleFileLaunch(fileHandle) {
                let self = this;
                const blob = await fileHandle.getFile();
                var file = new File([blob], fileHandle.name);
                await self.handleFile(file);
            },
            async handleFile(file) {
                let self = this;
                $('.loading-overlay').show()
                try {
                    const name = file.name;
                    const fileExtension = name.split('.').pop().toLowerCase();
                    let sourceContent;
                    let layer;
                    switch (fileExtension) {
                        case 'geojson':
                            sourceContent = await fileReaderHelper.readFileAsText(file);
                            layer = await layerGenerator.creatGeoJsonLayerFromText(name, sourceContent);
                            break;
                        case 'topojson':
                            sourceContent = await fileReaderHelper.readFileAsText(file);
                            layer = await layerGenerator.creatGeoJsonLayerFromText(name, sourceContent);
                            break;
                        case 'json':
                            sourceContent = await fileReaderHelper.readFileAsText(file);
                            const jsonObiect = JSON.parse(sourceContent)
                            if (!jsonObiect && !jsonObiect.Type) {
                                return;
                            }
                            if (jsonObiect.type.toLowerCase() === "topology") {
                                layer = await layerGenerator.creatTopoJsonLayerFromText(name, sourceContent);
                            }
                            if (jsonObiect.type.toLowerCase() === "featurecollection") {
                                layer = await layerGenerator.creatGeoJsonLayerFromText(name, sourceContent);
                            }
                            break;
                        case 'kml':
                            sourceContent = await fileReaderHelper.readFileAsText(file);
                            layer = await layerGenerator.creatKmlLayerFromText(name, sourceContent);
                            break;
                        case 'gpx':
                            sourceContent = await fileReaderHelper.readFileAsText(file);
                            layer = await layerGenerator.creatGpxLayerFromText(name, sourceContent);
                            //layer = await layerGenerator.creatGpxToGeoJsonLayerFromText(name, sourceContent);
                            break;
                        case 'gml':
                            sourceContent = await fileReaderHelper.readFileAsText(file);
                            layer = await layerGenerator.creatGmlLayerFromText(name, sourceContent);
                            break;
                        case 'zip':
                            sourceContent = await fileReaderHelper.readFileAsArrayBuffer(file);
                            layer = await layerGenerator.creatShapefileLayerFromArrayBuffer(name, sourceContent);

                            break;
                    }
                    if (sourceContent && layer) {
                        layer.setVisible(true);
                        const dataLayerLength = self.dataLayers.push(layer);
                        layer.setZIndex(dataLayerLength - 1);
                        await self.addLayerToMap(self.dataLayers[dataLayerLength - 1]);
                        await self.zoomToLayer(self.dataLayers[dataLayerLength - 1]);
                        await self.addLayertoDataTable(self.dataLayers[dataLayerLength - 1]);
                    }
                } catch (e) {
                    console.error(e);
                } finally {
                    $('.loading-overlay').hide();
                }

            },
            async addLayertoDataTable(layer) {
                let self = this;
                const data = layer.getSource().getFeatures().map((feature) => feature.getProperties());
                const columns = Object.getOwnPropertyNames(data[0]).filter(name => name != 'geometry').map(name =>
                    ({ field: name, title: name, sortable: true })
                );
                $('#layerDataTable').bootstrapTable('destroy');
                $('#layerDataTable').bootstrapTable({
                    columns: columns,
                    data: data,
                    pagination: true,
                    search: true,
                    regexSearch: true,
                    searchHighlight: true,
                    sortable: true,
                    sortEmptyLast: true,
                    onPageChange: function (currentPage, pageSize) {
                        console.log("目前頁數:" + currentPage + ",一頁顯示:" + pageSize + "筆");
                    },
                    paginationVAlign: 'both',
                    smartDisplay: true,
                    pageSize: 10,
                    pageList: [10, 20, 25, 50, 100],
                    formatRecordsPerPage: function (pageSize) {
                        return '&nbsp;&nbsp;每頁顯示' + pageSize + '筆';
                    },
                    formatShowingRows: function (fromIndex, toIndex, totalSize) {
                        //目前第幾頁
                        var currentPage = Math.ceil(fromIndex / this.pageSize);
                        //總共幾頁
                        var totalPageCount = Math.ceil(totalSize / this.pageSize);
                        return '第' + currentPage + '頁&nbsp;&nbsp;共' + totalPageCount + '頁';
                    },
                    onClickRow: function (row, el, field) {
                        console.log(row, el, field);
                        self.map.getView().fit(row.geometry.getExtent(), self.map.getSize());
                        self.map.getView().setZoom(17);
                        self.popFeature(row);
                    }
                });
                self.selectDataTableLayerName = layer.name;
            },
            async changDataTable() {
                let self = this;
                let layers = self.dataLayers.filter(layer => layer.name === self.selectDataTableLayerName);
                if (layers && layers.length > 0) {
                    await self.addLayertoDataTable(layers[0]);
                }
            },
            async popFeature(featureProperties, coordinate) {
                let self = this;
                self.disposePopover();
                if (!coordinate) {
                    coordinate = featureProperties.geometry.getCoordinates();

                    console.log('geometryCoordinates', coordinate);
                    const geometryExtent = featureProperties.geometry.getExtent();
                    console.log('geometryExtent', geometryExtent);
                    const geometryCenter = ol.extent.getCenter(geometryExtent);
                    console.log('geometryCenter', geometryCenter);
                }
                const data = Object.getOwnPropertyNames(featureProperties).filter(name => name != 'geometry').map(name =>
                    ({ name: name, value: featureProperties[name] })
                );
                const tablerow = data.map((item) => `<tr><td>${item.name}</td><td>${item.value}</td></tr>`);
                const tablehtml = `<table class="table table-striped table-hover">${tablerow.join('')}</table>`;
                //table table-striped
                const allowList = bootstrap.Tooltip.Default.allowList;
                allowList.table = [];
                allowList.thead = [];
                allowList.tr = [];
                allowList.th = [];
                allowList.tbody = [];
                allowList.td = [];
                allowList.tfoot = [];
                allowList.button = [];
                self.popupOverlay.setPosition(coordinate);
                self.popover = new bootstrap.Popover(self.popupElement, {
                    placement: 'top',
                    title: '<button href="#" class="btn-close popover-close" data-dismiss="alert"></button>',
                    html: true,


                    content: tablehtml
                });

                self.popover.show();
            },


            async changLayerVisible(e, layer) {
                let self = this;
                layer.setVisible(e.target.checked);
            },
            async changLayerZindex(layerNames) {
                let self = this;
                layerNames.forEach((layerName, index) => {
                    let layers = self.dataLayers.filter(layer => layer.name === layerName);
                    if (layers && layers.length > 0) {
                        layers[0].setZIndex(index);
                    }
                });
            },
            async deleteLayer(index, layer) {
                let self = this;

                self.map.removeLayer(layer);
                self.dataLayers.splice(index, 1,);
            }
        },
        watch: {},
        computed: {}
    }
);
app.mount('#app');

