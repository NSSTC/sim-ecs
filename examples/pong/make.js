const arg = require('arg');
const webpack = require('webpack');
const fs = require('fs-extra');
const path = require('path');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");

// arg handling
const args = arg({
    '--entry': String,
    '--out-dir': String,
    '--production': Boolean,
    '--watch': Boolean,

    '-e': '--entry',
    '-o': '--out-dir',
    '-p': '--production',
    '-w': '--watch',
});
const entryFile = path.resolve(__dirname, args['--entry'] || 'src/index.ts');
const outDir = path.resolve(__dirname, args['--out-dir'] || 'public');
const prod = !!args['--production'];
const watch = !!args['--watch'];


// build helpers
const log = (...strs) => console.log.apply(console.log, ['[make]'].concat(strs));


// build website
(async () => {
    log(
        'Started with options:',
        '\n  Entry File: ' + entryFile,
        '\n  Out Dir: ' + outDir,
        '\n  Prod: ' + prod.toString(),
        '\n  Watch: ' + watch.toString());

    log('Create public folder if missing and make sure it is empty');
    fs.emptyDirSync(outDir);


    log('Build app');
    await new Promise((res, rej) => {
        const compiler = webpack({
            mode: prod ? 'production' : 'development',
            devtool: prod ? undefined : 'source-map',
            entry: entryFile,
            target: 'web',
            watch,
            output: {
                path: outDir,
                filename: 'bundle.js'
            },
            optimization: {
                minimize: true,
                minimizer: [new TerserPlugin({
                    terserOptions: {
                        keep_classnames: true,
                    },
                })],
            },
            resolve: {
                extensions: ['.js', '.ts'],
                modules: ['node_modules'],
            },
            externals: {
                './bundle.js': 'bundle.js',
            },
            module: {
                rules: [
                    {// html files
                        test: /\.html?$/i,
                        use: [
                            "file-loader?name=[name].html",
                            "extract-loader",
                            {
                                loader: "html-loader",
                                options: {
                                    sources: {
                                        urlFilter: (_attribute, value, _resourcePath) => !/bundle\.js$/i.test(value),
                                    },
                                }
                            },
                        ]
                    },
                    {// typescript
                        test: /\.tsx?$/i,
                        loader: 'ts-loader',
                        options: {
                            allowTsInNodeModules: true,
                        },
                    },
                    {// main scss
                        test: /\.s[ac]ss$/i,
                        include: path.resolve(__dirname, 'src', 'main.scss'),
                        use: [
                            'style-loader',
                            {
                                loader: 'css-loader',
                                options: {
                                    sourceMap: !prod,
                                }
                            },
                            {
                                loader: 'sass-loader',
                                options: {
                                    sourceMap: !prod,
                                }
                            }
                        ],
                    },
                    {// component scss
                        test: /\.s[ac]ss$/i,
                        exclude: path.resolve(__dirname, 'src', 'main.scss'),
                        use: [
                            'to-string-loader',
                            {
                                loader: 'css-loader',
                                options: {
                                    esModule: false,
                                    sourceMap: !prod,
                                }
                            },
                            {
                                loader: 'sass-loader',
                                options: {
                                    sourceMap: !prod,
                                }
                            }
                        ],
                    },
                ],
            },
            plugins: [
                new ProgressBarPlugin(),
                new webpack.IgnorePlugin({
                    resourceRegExp: /bundle\.js$/i,
                }),
            ],
        });

        const handler = (err, stats) => { // Stats Object
            if (err || stats.hasErrors()) {
                if (Array.isArray(stats.compilation.errors)) {
                    stats.compilation.errors.forEach(err => console.error(err));
                }

                rej({err, further: stats.compilation.systemErrors});
                return;
            }

            process.stdout.write(stats.toString() + '\n');
            res();
        };

        if (watch) {
            log('Start watcher...');
            compiler.watch({}, handler);
        }
        else {
            log('Start compilation...');
            compiler.run(handler);
        }
    });
})().catch(console.error).finally(() => log('FINISHED'));
