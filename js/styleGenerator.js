const styles = {
    'Point': function () {
        return new ol.style.Style({
            image: new ol.style.Circle({
                radius: 8,
                fill: new ol.style.Fill({
                    color: 'rgb(51,153,204,0.3)',
                }),
                stroke: new ol.style.Stroke({ color: 'rgb(51,153,204)', width: 1 }),
            }),
        });
    },
    'LineString': function () {
        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#3399CC',
                width: 2,
            }),
        });
    },
    'MultiLineString': function () {
        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#3399CC',
                width: 2,
            }),
        });
    },
    'MultiPoint': function () {
        return new ol.style.Style({
            image: new ol.style.Circle({
                radius: 5,
                fill: new ol.style.Fill({
                    color: 'rgba(255,255,255,0.5)',
                }),
                stroke: new ol.style.Stroke({ color: '#3399CC', width: 1 }),
            }),
        });
    },
    'MultiPolygon': function () {
        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#3399CC',
                width: 2,
            }),
            fill: new ol.style.Fill({
                color: 'rgba(255,255,255,0.5)',
            }),
        });
    },
    'Polygon': function () {
        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#3399CC',
                width: 2,
            }),
            fill: new ol.style.Fill({
                color: 'rgba(255,255,255,0.5)',
            }),
        });
    },
    'GeometryCollection': function () {
        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#3399CC',
                width: 2,
            }),
            fill: new ol.style.Fill({
                color: 'rgba(255,255,255,0.5)',
            }),
            image: new ol.style.Circle({
                radius: 10,
                fill: null,
                stroke: new ol.style.Stroke({
                    color: 'rgba(255,255,255,0.5)',
                }),
            }),
        });
    },
    'Circle': function () {
        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#3399CC',
                width: 2,
            }),
            fill: new ol.style.Fill({
                color: 'rgba(255,255,255,0.5)',
            }),
        });
    },
};

const styleFunction = function (feature, colorstr) {
    const geometryType = feature.getGeometry().getType();
    let color = null;
    if (!colorstr) {
        color = d3.rgb(d3.scaleSequential(d3.interpolateRainbow).domain([1, 1000000])(d3.randomUniform(1, 1000000)()));
    } else {
        color = d3.rgb(colorstr);
    }
    const strokeColor = color.formatRgb();
    color.opacity = 0.3;
    const fillColor = color.formatRgb();
    const style = styles[geometryType]();

    const stroke = new ol.style.Stroke({
        color: strokeColor,
        width: 2,
    });
    const fill = new ol.style.Fill({
        color: fillColor,
    })

    if (style) {
        if (style.getImage()) {
            style.getImage().setStroke(stroke);
            style.getImage().setFill(fill);
        }
        if (style.getStroke()) {
            style.setStroke(stroke);
        }
        if (style.getFill()) {
            style.setFill(fill);
        }
    }
    return style;
};

const GpxstyleFunction = function (feature) {
    const geometry = feature.getGeometry();
    console.log(feature.getGeometry().getType())
    const style = styles[feature.getGeometry().getType()];
    console.log(style);
    const gpxStyles = [
        style
    ];
    geometry.getLineStrings().forEach((lineString) => {

        lineString.forEachSegment(function (start, end) {
            const dx = end[0] - start[0];
            const dy = end[1] - start[1];
            const rotation = Math.atan2(dy, dx);
            // arrows
            gpxStyles.push(
                new ol.style.Style({
                    geometry: new ol.geom.Point(end),
                    image: new ol.style.Icon({
                        src: 'image/right-arrow.png',
                        anchor: [0.75, 0.5],
                        rotateWithView: true,
                        rotation: -rotation,
                    }),
                })
            );
        });
    });



    return gpxStyles;
};