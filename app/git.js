/**
 * git.js
 *
 * Timeline
 * by Timeline Software, LLC
 * 
 * Alex Riley & Zach DeGeorge
 * Alex@TimelineFM.com & Zach@TimelineFM.com
 *
 * Print the Git information to the console when the server is launched
 */

module.exports.print = function(git, exec, winston) {

    winston.info('Status: ', "OK")
    winston.info('Environment: ', process.env.NODE_ENV)

    git.tag(function(str) { winston.info('tag:     ', str) }) // => 0.1.0 
    git.branch(function(str) { winston.info('branch:  ', str) }) // => master

};