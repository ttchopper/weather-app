import gulp from 'gulp';
import pug from 'gulp-pug';
import gulpStylus from 'gulp-stylus';
import debug from 'gulp-debug';
import sourcemaps from 'gulp-sourcemaps';
import del from 'del';
import browserSync from 'browser-sync';
import { resolver } from 'stylus';
import autoprefixer from 'gulp-autoprefixer';
import plumber from 'gulp-plumber';
import svgSprite from 'gulp-svg-sprite';
import cheerio from 'gulp-cheerio';
import babel from 'gulp-babel';
import concat from 'gulp-concat';
import webpack from 'webpack-stream';
const bs = browserSync.create();

gulp.task('clean', () => {
    return del(['build/**/*', '!build/.git' ]);
});

gulp.task('html', () => {
    return gulp.src('src/root/index.pug')
        .pipe(plumber())
        .pipe(pug(
            {
                pretty: true,
                baseDir: 'src'
            }
        ))
        .pipe(gulp.dest('build'));
});


gulp.task('styles', () => {
    return gulp.src('src/root/index.styl')

        .pipe(sourcemaps.init())
        .pipe(plumber({
            handleError: function (err) {
                console.log(err);
                this.emit('end');
            }
        }))
        .pipe(gulpStylus(
            {   
                'include css': true,
                compress: false,
                define: {
                    url: resolver()
                }
            }
        ))
        .pipe(autoprefixer(
            {
                browsers: ['last 7 iOS versions']
            }
        ))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('build/styles'));
});

gulp.task('webpack', () => {
    return gulp.src('src/root/index.js')
        .pipe(plumber())
        .pipe(webpack({
            // babel-polyfill to enable promises in old browsers
            entry: ['babel-polyfill', './src/root/index.js'],
            output: {
                filename: 'index.js',
                library: 'index'
            },
            devtool: 'source-map',
            module: {
                loaders: [
                    {
                        loader: "babel-loader",
                        test: /\.jsx?$/,
                        exclude: /node_modules/
                    }
                ]
            }
        }))

        //.pipe(sourcemaps.init())
        //.pipe(plumber())
        //.pipe(babel({
        //    presets: ['es2015'],
        //    minified: true
        //}))
        //.pipe(concat('index.js'))
        //.pipe(sourcemaps.write())
        .pipe(gulp.dest('build/js/'));
});

gulp.task('assets', () => {
    return gulp.src('src/**/*.{png,jpg,JPG}')
        .pipe(gulp.dest('build'));
});


gulp.task('sprite', () => {
    return gulp.src('src/**/*.svg')
        .pipe(cheerio(($, file, done) => {
            // Removing fill attribute
            $('[fill]').removeAttr('fill');
            done();
        }))
        .pipe(svgSprite(
            {
                mode: {
                    dimensionAttributes: true,
                    symbol: {
                        sprite: __dirname + '/img/sprite.css.svg'
                    }
                }
            }
        ))
        .pipe(gulp.dest('build'));
});

gulp.task('build', gulp.series(
    'clean',
    gulp.parallel('styles', 'html', 'assets', 'sprite', 'webpack'))
);

gulp.task('watch', () => {
    gulp.watch('src/**/*.styl', gulp.series('styles'));
    gulp.watch('src/**/*.pug', gulp.series('html'));
    gulp.watch('src/**/*.{png,jpg}', gulp.series('assets'));
    gulp.watch('src/**/*.svg', gulp.series('sprite'));
    gulp.watch('src/**/*.js', gulp.series('webpack'));
})



gulp.task('serve', () => {
    bs.init({
        server: 'build',
        cors: true
    });

    bs.watch('build/**/*.*').on('change', bs.reload);
});

gulp.task('dev', gulp.series('build', gulp.parallel('watch', 'serve')));
