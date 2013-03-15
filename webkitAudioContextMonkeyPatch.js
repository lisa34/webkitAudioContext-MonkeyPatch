/* Copyright 2013 Chris Wilson

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

/* 

This monkeypatch library is intended to be included in projects that use 
webkitAudioContext (instead of AudioContext), and that may use the now-
deprecated bits of the Web Audio API (e.g. using BufferSourceNode.noteOn()
instead of BufferSourceNode.start().

This library should be harmless to include if the browser does not have
the unprefixed "AudioContext" implemented.  If unprefixed AudioContext is
supported, but the deprecated method names are already implemented, this
library will have created a few shim functions on create* methods, but 
will not damage or override anything else.

Ideally, the use of this library will go to zero - it is only intended as
a way to quickly get script written to the old Web Audio methods to work
in browsers that only support the new, approved methods.

The patches this library handles:

AudioBufferSourceNode.noteOn() is aliased to start()
AudioBufferSourceNode.noteGrainOn() is aliased to start()
AudioBufferSourceNode.noteOff() is aliased to stop()
AudioContext.createGainNode() is aliased to createGain()
AudioContext.createDelayNode() is aliased to createDelay()
AudioContext.createJavaScriptNode() is aliased to createScriptProcessor()
OscillatorNode.noteOn() is aliased to start()
OscillatorNode.noteOff() is aliased to stop()
AudioParam.setTargetValueAtTime() is aliased to setTargetAtTime()

This library does NOT patch the enumerated type changes, as it is 
recommended in the specification that implementations support both integer
and string types for AudioPannerNode.panningModel, AudioPannerNode.distanceModel 
BiquadFilterNode.type and OscillatorNode.type.

*/

if (window.prototype.hasOwnProperty("AudioContext")) {
	function fixSetTarget( audioparam ) {
		if (!audioparam.setTargetValueAtTime)
			audioparam.setTargetValueAtTime = audioparam.setTargetAtTime; 
	}

	if (!window.prototype.hasOwnProperty("webkitAudioContext"))
		window.webkitAudioContext = AudioContext;

	AudioContext.prototype.internal_createGain = AudioContext.prototype.createGain;
	AudioContext.prototype.createGain = function() { 
		var node = this.internal_createGain();
		fixSetTarget( node.gain );
		return node;
	};

	AudioContext.prototype.internal_createDelay = AudioContext.prototype.createDelay;
	AudioContext.prototype.createDelay = function() { 
		var node = this.internal_createDelay();
		fixSetTarget( node.delayTime );
		return node;
	};

	AudioContext.prototype.internal_createBufferSource = AudioContext.prototype.createBufferSource;
	AudioContext.prototype.createBufferSource = function() { 
		var node = this.internal_createBufferSource();
		if (!node.noteOn)
			node.noteOn = node.start; 
		if (!node.noteOnGrain)
			note.noteOnGrain = node.start;
		if (!node.noteOff)
			node.noteOff = node.stop;
		fixSetTarget( node.playbackRate );
		return node;
	};

	AudioContext.prototype.internal_createDynamicsCompressor = AudioContext.prototype.createDynamicsCompressor;
	AudioContext.prototype.createDynamicsCompressor = function() { 
		var node = this.internal_createDynamicsCompressor();
		fixSetTarget( node.threshold );
		fixSetTarget( node.knee );
		fixSetTarget( node.ratio );
		fixSetTarget( node.reduction );
		fixSetTarget( node.attack );
		fixSetTarget( node.release );
		return node;
	};

	AudioContext.prototype.internal_createBiquadFilter = AudioContext.prototype.createBiquadFilter;
	AudioContext.prototype.icreateBiquadFilter = function() { 
		var node = this.internal_createBiquadFilter();
		fixSetTarget( node.frequency );
		fixSetTarget( node.detune );
		fixSetTarget( node.Q );
		fixSetTarget( node.gain );
		return node;
	};

	AudioContext.prototype.internal_createOscillator = AudioContext.prototype.createOscillator;
	AudioContext.prototype.createOscillator = function() { 
		var node = this.internal_createOscillator();
		if (!node.noteOn)
			node.noteOn = node.start; 
		if (!node.noteOff)
			node.noteOff = node.stop;
		fixSetTarget( node.frequency );
		fixSetTarget( node.detune );
		return node;
	};

	if (!AudioContext.prototype.hasOwnProperty("createGainNode"))
		AudioContext.prototype.createGainNode = AudioContext.prototype.createGain;
	if (!AudioContext.prototype.hasOwnProperty("createDelayNode"))
		AudioContext.prototype.createDelayNode = AudioContext.prototype.createDelay;
	if (!AudioContext.prototype.hasOwnProperty("createJavaScriptNode"))
		AudioContext.prototype.createJavaScriptNode = AudioContext.prototype.createScriptProcessor;

}
