layerGenerator =
{
    colorer: d3.scaleSequential(d3.interpolateRainbow).domain([1, 1000000]),
    randomer: d3.randomUniform(1, 1000000),
    creatGeoJsonLayerFromText: async function (name, textContent) {
        let features = new ol.format.GeoJSON().readFeatures(textContent, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
        });
        features.map(feature => {
            let randomColor = d3.rgb(layerGenerator.colorer(layerGenerator.randomer())).formatRgb();;
            const featurstyle = styleFunction(feature, randomColor);
            feature.setStyle(featurstyle);
        });
        let source = new ol.source.Vector({
            features: features
        });
        //let layer = new ol.layer.Vector({ source: source});
        let layer = new ol.layer.VectorImage({ source: source });
        //var vectorImageLayer = new ol.layer.VectorImage({ source: vectorSource });
        layer.name = name;
        return layer;
    },
    creatTopoJsonLayerFromText: async function (name, textContent) {
        let features = new ol.format.TopoJSON().readFeatures(textContent, {
            featureProjection: 'EPSG:3857'
        });
        features.map(feature => {
            let randomColor = d3.rgb(layerGenerator.colorer(layerGenerator.randomer())).formatRgb();;
            const featurstyle = styleFunction(feature, randomColor);
            feature.setStyle(featurstyle);
        });
        let source = new ol.source.Vector({
            features: features
        });
        let layer = new ol.layer.VectorImage({ source: source });
        layer.name = name;
        return layer;
    },
    creatKmlLayerFromText: async function (name, textContent) {
        let features = new ol.format.KML().readFeatures(textContent, {
            featureProjection: 'EPSG:3857'
        });
        /*features.map(feature=>{
            let randomColor= d3.rgb(layerGenerator.colorer(layerGenerator.randomer())).formatRgb();;
            const featurstyle=styleFunction(feature,randomColor);
            feature.setStyle(featurstyle);
        });*/
        let source = new ol.source.Vector({
            features: features
        });
        let layer = new ol.layer.VectorImage({ source: source });
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
        let layer = new ol.layer.VectorImage({ source: source });
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
        let features = new ol.format.GML().readFeatures(textContent, {
            featureProjection: 'EPSG:3857'
        });
        features.map(feature => {
            let randomColor = d3.rgb(layerGenerator.colorer(layerGenerator.randomer())).formatRgb();;
            const featurstyle = styleFunction(feature, randomColor);
            feature.setStyle(featurstyle);
        });
        let source = new ol.source.Vector({
            features: features
        });
        let layer = new ol.layer.VectorImage({ source: source });
        layer.name = name;
        return layer;
    },
    creatShapefileLayerFromArrayBuffer: async function (name, arrayBuffer) {
        let geojson = await shp(arrayBuffer);
        var features = new ol.format.GeoJSON().readFeatures(geojson, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
        });
        features.map(feature => {
            let randomColor = d3.rgb(layerGenerator.colorer(layerGenerator.randomer())).formatRgb();;
            const featurstyle = styleFunction(feature, randomColor);
            feature.setStyle(featurstyle);
        });
        var source = new ol.source.Vector({
            features: features
        });
        let layer = new ol.layer.VectorImage({ source: source });
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