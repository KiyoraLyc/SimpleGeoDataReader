layerGenerator =
{
    creatGeoJsonLayerFromText: async function (name, textContent) {
        let features = new ol.format.GeoJSON().readFeatures(textContent, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
        });
        let source = new ol.source.Vector({
            features: features
        });
        const clusterSource = new ol.source.Cluster({
            distance: parseInt(40, 10),
            minDistance: parseInt(20, 10),
            source: source,
        });
        let layer = new ol.layer.VectorImage({ source: source, style: styleFunction });
        //let layer = new ol.layer.Vector({ source: clusterSource });
        //var vectorImageLayer = new ol.layer.VectorImage({ source: vectorSource });
        layer.name = name;
        return layer;
    },
    creatTopoJsonLayerFromText: async function (name, textContent) {
        let features = new ol.format.TopoJSON().readFeatures(textContent, {
            featureProjection: 'EPSG:3857'
        });
        let source = new ol.source.Vector({
            features: features
        });
        let layer = new ol.layer.VectorImage({ source: source, style: styleFunction });
        layer.name = name;
        return layer;
    },
    creatKmlLayerFromText: async function (name, textContent) {
        let features = new ol.format.KML().readFeatures(textContent, {
            featureProjection: 'EPSG:3857'
        });
        let source = new ol.source.Vector({
            features: features
        });
        let layer = new ol.layer.VectorImage({ source: source, style: styleFunction });
        layer.name = name;
        return layer;
    },
    creatGpxToGeoJsonLayerFromText: async function (name, textContent) {
        textContent = toGeoJSON.gpx(textContent)
        let features = new ol.format.GeoJSON().readFeatures(textContent, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
        });
        let source = new ol.source.Vector({
            features: features
        });
        let layer = new ol.layer.VectorImage({ source: source, style: GpxstyleFunction });
        layer.name = name;
        return layer;
    },
    creatGpxLayerFromText: async function (name, textContent) {
        let features = new ol.format.GPX().readFeatures(textContent, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
        });
        let source = new ol.source.Vector({
            features: features
        });
        let layer = new ol.layer.VectorImage({ source: source, style: GpxstyleFunction });
        layer.name = name;
        return layer;
    },
    creatGmlLayerFromText: async function (name, textContent) {
        let features = new ol.format.GML3().readFeatures(textContent, {
            featureProjection: 'EPSG:3857'
        });
        let source = new ol.source.Vector({
            features: features
        });
        let layer = new ol.layer.VectorImage({ source: source, style: styleFunction });
        layer.name = name;
        return layer;
    },
    creatShapefileLayerFromArrayBuffer: async function (name, arrayBuffer) {
        let geojson = await shp(arrayBuffer);
        var features = new ol.format.GeoJSON().readFeatures(geojson, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
        });
        var source = new ol.source.Vector({
            features: features
        });
        let layer = new ol.layer.VectorImage({ source: source, style: styleFunction });
        layer.name = name;
        return layer;
    },
    creatGeoJsonLayerFromUrl: async function (name, url) {
        let format = new ol.format.GeoJSON();
        let source = new ol.source.Vector({
            url: url,
            format: format
        });
        let layer = new ol.layer.VectorImage({ source: source, style: styleFunction });
        layer.name = name;
        return layer;
    },
    creatKmlLayerFromUrl: async function (name, url) {
        let format = new ol.format.KML();
        let source = new ol.source.Vector({
            url: url,
            format: format
        });
        let layer = new ol.layer.VectorImage({ source: source, style: styleFunction });
        layer.name = name;
        return layer;
    },
    creatXYZLayerFromUrl: async function (name, url) {
        let source = new ol.source.XYZ({
            url: url
        });
        //let layer = new ol.layer.Tile({ source: source, style: styleFunction });
        let layer = new ol.layer.WebGLTile({ source: source });
        layer.name = name;
        return layer;
    },
    creatWMSLayerFromUrl: async function (name, url, layersName) {
        let source = new ol.source.TileWMS({
            url: url,
            params: { 'LAYERS': layersName, 'TILED': true },
            crossOrigin: 'anonymous',
            matrixSet: "EPSG:3857",
            format: "image/png",
        });
        let layer = new ol.layer.WebGLTile({ source: source });
        layer.name = name;
        return layer;
    },
    creatWMTSLayerFromUrl: async function (name, url, layersName) {
        let source = new ol.source.WMTS({
            url: url,
            layer: layersName

        });
        let layer = new ol.layer.WebGLTile({ source: source });
        layer.name = name;
        return layer;
    }
}