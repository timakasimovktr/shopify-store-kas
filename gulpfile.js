/** 
** Must Exclude following file from deployment on
** Beanstalk app.
**/

// *package*.json
// *source*
// *node_modules*
// *babel.config*.json
// **/*.zip
// *gulpfile*.js

// Initialize modules

const { src, dest, watch, series, parallel } = require('gulp');
const gulpCopy = require('gulp-copy');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const concat = require('gulp-concat');
const postcss = require('gulp-postcss');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const zip = require('gulp-zip');
const rollup = require('gulp-better-rollup');
const babel = require('rollup-plugin-babel');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const replace = require('@rollup/plugin-replace');
const json = require('@rollup/plugin-json');
const alias = require('@rollup/plugin-alias');
const vue = require('rollup-plugin-vue');
const minify = require('rollup-plugin-babel-minify');
const purgecss = require('@fullhuman/postcss-purgecss');

// File path variables
const files = {
	mainPath: '/',
	fontsPath: 'source/fonts/**/*',
	imagesPath: ['source/images/**/*', '!source/images/temp/**/*'],
	scssPath: 'source/scss/main.scss',
	jsPath: 'source/js/main.js',
	jsProductPath: 'source/js/products.js',
	checkoutPath: 'source/js/checkout/checkout.js',
	vuePath: 'source/js/products/customizer/**/*.vue',
	purgecssPath: ['./**/*.html', './**/*.liquid'], 
	destination: 'assets',
}

// Fonts task
function fontsTask() {
	return src(files.fontsPath)
		.pipe(gulpCopy(files.destination, { prefix: 2 })
	);
}

// Images task
function imagesTask() {
	return src(files.imagesPath, { nodir: true })
		.pipe(gulpCopy(files.destination, { prefix: 4 })
	);
}

// Sass task
function scssTask() {
	return src(files.scssPath)
		// .pipe(sourcemaps.init())
			.pipe(sass({includePaths: ['node_modules']}).on('error', sass.logError))
			.pipe(postcss([ 
				autoprefixer(),
				// purgecss({ content: files.purgecssPath, keyframes: true }),
				cssnano({ preset: 'default' })
			]))
		// .pipe(sourcemaps.write())
		.pipe(concat('bundle.min.css.liquid'))
		.pipe(dest(files.destination)
	);
}

// JS task
function jsTask() {
	return src(files.jsPath)
		.pipe(
			rollup({ 
				plugins: [
					babel(),
					resolve({ preferBuiltins: true, mainFields: ['browser'] }),
					commonjs(),
					json(),
					minify({ comments: false })
				]
			}, 'umd')
		)
		.pipe(rename("bundle.min.js"))
		.pipe(dest(files.destination)
	);
}

// JS Checkout task (split)
function jsCheckoutTask() {
	return src(files.checkoutPath)
		.pipe(
			rollup({ 
				plugins: [
					babel(),
					resolve({ preferBuiltins: true, mainFields: ['browser'] }),
					commonjs(),
					json(),
					minify({comments: false})
					] 
			}, 'umd')
		)
		.pipe(rename("checkout.min.js"))
		.pipe(dest(files.destination)
	);
}

// JS Product task (split)
function jsProductTask() {
	return src(files.jsProductPath)
		.pipe(
			rollup({ 
				plugins: [
					replace({'process.env.NODE_ENV': JSON.stringify('production')}),
					babel(),
					resolve({ preferBuiltins: true, mainFields: ['browser'] }),
					commonjs(),
					vue({
            css: false,
            compileTemplate: true,
            runtimeCompiler: true
        	}),
					json(),
					minify({comments: false})
					] 
			}, 'umd')
		)
		.pipe(rename("products.min.js"))
		.pipe(dest(files.destination)
	);
}

// Watch task
const watchTask = () => {
	watch([files.fontsPath], fontsTask);
	watch([files.imagesPath], imagesTask);
	watch([files.scssPath], scssTask);
	watch([files.jsPath], jsTask);
	watch([files.checkoutPath], jsCheckoutTask);
	watch([files.jsProductPath], jsProductTask);
}

// Zip task
function zipTask() {
	return src(files.mainPath)
		.pipe(zip('shopify.zip'))
		.pipe(dest('./'));
}

// Default task
exports.default = series(
	parallel(fontsTask, imagesTask, scssTask, jsTask, jsCheckoutTask, jsProductTask)
	// ,zipTask
	// watchTask
);

// -----Watchers-----
exports.watchJs = () => {
	watch(['source/js/main.js', 'source/js/general/**', 'source/js/products/**'], jsTask);
};

exports.watchJsProduct = () => {
	watch(['source/js/products.js', 'source/js/general/**', 'source/js/products/**'], jsProductTask);
};

exports.watchJsCheckout = () => {
	watch(['source/js/checkout/checkout.js'], jsCheckoutTask);
};

exports.watchScss = () => {
	watch(['source/scss/main.scss'], scssTask);
};