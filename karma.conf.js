var path = require("path");
var webpackConfig = require("./webpack.config");

webpackConfig.entry = {};

module.exports = function (config) {
    config.set({
        webpack: webpackConfig,
        browsers: ["PhantomJS"],
        // browsers: ["Chrome"],
        frameworks: ["jasmine"],
        files: [
            "test/main.ts"
        ],
        preprocessors: {
            "**/*.ts": ["webpack"]
        },
        reporters: ["progress", "html"],
        htmlReporter: {
            outputFile: "reports/report.html",
            pageTitle: "Entity-Space Tests",
            groupSuites: true,
            useCompactStyle: true
        },
        webpackMiddleware: {
            noInfo: true
        }
    });
}