var fs = require('fs');
var spawn = require('child_process').spawn;

var commands, procs;

try {
	
	commands = fs
		.readFileSync('spin.up', {encoding: 'utf8'})
		.split(/\n+/)
		.map(function(l) { return l.replace(/#[^$]*$/, ''); })
		.map(function(l) { return l.trim(); })
		.filter(function(l) { return l.length > 0; });

} catch (e) {

	process.stderr.write("no spin.up file found!");
	process.exit(1);

}

var nextColor = 0;
function makeColor() {
	// cycles green, yellow, blue, magenta, cyan
	return ((nextColor++) % 5) + 2;
}

procs = commands.map(function(c, taskIx) {

	var args 	= c.split(/\s+/);
	var cmd  	= args.shift();
	var color 	= makeColor();
	var child 	= spawn(cmd, args);
	var prefix 	= "[" + taskIx + ":" + child.pid + "]";

	function _colorize(text) {
		return "\x1b[3" + color + "m" + text + "\x1b[0m";
	}

	process.stderr.write(_colorize(prefix + " " + c) + "\n");

	child.stdout.setEncoding('utf8');
	child.stdout.on('data', function(str) {
		process.stdout.write(_colorize(prefix + " " + str));
	});

	child.stderr.setEncoding('utf8');
	child.stderr.on('data', function(str) {
		process.stderr.write(_colorize(prefix + " " + str));
	});

	child.on('exit', function() {
		process.stderr.write(prefix + " terminated\n");
	});

	child.on('error', function(err) {
		console.log(err);
	});

});
