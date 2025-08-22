export const phpSnippet = `
<span data-token="comment">// --- For some reason i couldn't make the language server work so this is the code based on the textmate scope colorization ---</span>

<span data-token="annotation">&lt;?php</span>

<span data-token="comment">// --- Define namespaces and create placeholder classes ---</span>
<span data-token="keyword">namespace</span> <span data-token="namespace">App\\Services</span> <span data-token="punctuation">{</span>
    <span data-token="keyword">class</span> <span data-token="class">Logger</span> <span data-token="punctuation">{</span>
        <span data-token="keyword">public</span> <span data-token="keyword">function</span> <span data-token="functionAndMethod">log</span><span data-token="punctuation">(</span><span data-token="type">string</span> <span data-token="variable">$message</span><span data-token="punctuation">)</span><span data-token="operator">:</span> <span data-token="type">void</span> <span data-token="punctuation">{</span>
            <span data-token="functionAndMethod">echo</span> <span data-token="string">"[LOG]: "</span> <span data-token="operator">.</span> <span data-token="variable">$message</span> <span data-token="operator">.</span> <span data-token="string">"</span><span data-token="constant">\\n</span><span data-token="string">"</span><span data-token="punctuation">;</span>
        <span data-token="punctuation">}</span>
    <span data-token="punctuation">}</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// --- Main namespace for the application core ---</span>
<span data-token="keyword">namespace</span> <span data-token="namespace">App\\Core</span> <span data-token="punctuation">{</span>

    <span data-token="keyword">use</span> <span data-token="namespace">App\\Services\\</span><span data-token="class">Logger</span><span data-token="punctuation">;</span>
    <span data-token="keyword">use</span> <span data-token="class">Attribute</span><span data-token="punctuation">;</span>

    <span data-token="comment">// Attributes are the equivalent of decorators/annotations in PHP 8+</span>
    <span data-token="fieldAndAttribute">#[</span><span data-token="fieldAndAttribute">Attribute</span><span data-token="fieldAndAttribute">]</span>
    <span data-token="keyword">class</span> <span data-token="class">Route</span> <span data-token="punctuation">{</span>
        <span data-token="keyword">public</span> <span data-token="keyword">function</span> <span data-token="functionAndMethod">__construct</span><span data-token="punctuation">(</span><span data-token="keyword">public</span> <span data-token="type">string</span> <span data-token="variable">$path</span><span data-token="punctuation">)</span> <span data-token="punctuation">{}</span>
    <span data-token="punctuation">}</span>

    <span data-token="comment">// A backed Enum (PHP 8.1+)</span>
    <span data-token="keyword">enum</span> <span data-token="class">Status</span><span data-token="punctuation">:</span> <span data-token="type">string</span> <span data-token="punctuation">{</span>
        <span data-token="keyword">case</span> <span data-token="constant">Pending</span> <span data-token="operator">=</span> <span data-token="string">'pending'</span><span data-token="punctuation">;</span>
        <span data-token="keyword">case</span> <span data-token="constant">Completed</span> <span data-token="operator">=</span> <span data-token="string">'completed'</span><span data-token="punctuation">;</span>
    <span data-token="punctuation">}</span>

    <span data-token="comment">// An interface for processable items</span>
    <span data-token="keyword">interface</span> <span data-token="interface">IProcessable</span> <span data-token="punctuation">{</span>
        <span data-token="keyword">public</span> <span data-token="keyword">function</span> <span data-token="functionAndMethod">process</span><span data-token="punctuation">(</span><span data-token="type">array</span> <span data-token="variable">$data</span><span data-token="punctuation">)</span><span data-token="operator">:</span> <span data-token="type">bool</span><span data-token="punctuation">;</span>
    <span data-token="punctuation">}</span>

    <span data-token="comment">// A readonly class (PHP 8.2+) can serve as a struct/record</span>
    <span data-token="keyword">final</span> <span data-token="keyword">readonly</span> <span data-token="keyword">class</span> <span data-token="class">Point</span> <span data-token="punctuation">{</span>
        <span data-token="keyword">public</span> <span data-token="keyword">function</span> <span data-token="functionAndMethod">__construct</span><span data-token="punctuation">(</span>
            <span data-token="keyword">public</span> <span data-token="type">int</span> <span data-token="variable">$x</span><span data-token="punctuation">,</span>
            <span data-token="keyword">public</span> <span data-token="type">int</span> <span data-token="variable">$y</span>
        <span data-token="punctuation">)</span> <span data-token="punctuation">{}</span>
    <span data-token="punctuation">}</span>

    <span data-token="keyword">class</span> <span data-token="class">DataService</span> <span data-token="keyword">implements</span> <span data-token="class">IProcessable</span> <span data-token="punctuation">{</span>
        <span data-token="keyword">public</span> <span data-token="keyword">const</span> <span data-token="constant">VERSION</span> <span data-token="operator">=</span> <span data-token="string">'1.0'</span><span data-token="punctuation">;</span>
        <span data-token="keyword">private</span> <span data-token="type">array</span> <span data-token="variable">$listeners</span> <span data-token="operator">=</span> <span data-token="punctuation">[]</span><span data-token="punctuation">;</span>
        
        <span data-token="comment">// Constructor property promotion</span>
        <span data-token="keyword">public</span> <span data-token="keyword">function</span> <span data-token="functionAndMethod">__construct</span><span data-token="punctuation">(</span><span data-token="keyword">private</span> <span data-token="class">Logger</span> <span data-token="variable">$logger</span><span data-token="punctuation">)</span> <span data-token="punctuation">{}</span>

        <span data-token="comment">// A delegate is a 'callable' type</span>
        <span data-token="keyword">public</span> <span data-token="keyword">function</span> <span data-token="functionAndMethod">on</span><span data-token="punctuation">(</span><span data-token="type">callable</span> <span data-token="variable">$listener</span><span data-token="punctuation">)</span><span data-token="punctuation">:</span> <span data-token="type">void</span> <span data-token="punctuation">{</span>
            <span data-token="keyword">$this</span><span data-token="operator">-></span><span data-token="property">listeners</span><span data-token="punctuation">[]</span> <span data-token="operator">=</span> <span data-token="variable">$listener</span><span data-token="punctuation">;</span>
        <span data-token="punctuation">}</span>

        <span data-token="fieldAndAttribute">#[</span><span data-token="fieldAndAttribute">Route</span><span data-token="punctuation">(</span><span data-token="parameter">path</span><span data-token="punctuation">:</span> <span data-token="string">'/process'</span><span data-token="punctuation">)</span><span data-token="fieldAndAttribute">]</span>
        <span data-token="keyword">public</span> <span data-token="keyword">function</span> <span data-token="functionAndMethod">process</span><span data-token="punctuation">(</span><span data-token="type">array</span> <span data-token="variable">$data</span><span data-token="punctuation">)</span><span data-token="punctuation">:</span> <span data-token="type">bool</span> <span data-token="punctuation">{</span>
            <span data-token="comment">// Updated string interpolation syntax for PHP 8.2+</span>
            <span data-token="variable">$logMessage</span> <span data-token="operator">=</span> <span data-token="string">&lt;&lt;&lt;</span><span data-token="keyword">LOG</span>
            <span data-token="string">Processing item with ID:</span> </span><span data-token="variable">{</span><span data-token="variable">$data</span><span data-token="string">[</span><span data-token="string">"id"</span><span data-token="string">]</span><span data-token="variable">}</span>
            <span data-token="keyword">LOG</span><span data-token="punctuation">;</span>
            
            <span data-token="keyword">$this</span><span data-token="operator">-></span><span data-token="property">logger</span><span data-token="operator">-></span><span data-token="functionAndMethod">log</span><span data-token="punctuation">(</span><span data-token="string">"Processing data..."</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>

            <span data-token="comment">// '$this' syntax</span>
            <span data-token="keyword">foreach</span> <span data-token="punctuation">(</span><span data-token="keyword">$this</span><span data-token="operator">-></span><span data-token="property">listeners</span> <span data-token="operator">as</span> <span data-token="variable">$listener</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
                <span data-token="functionAndMethod">$listener</span><span data-token="punctuation">(</span><span data-token="variable">$logMessage</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
            <span data-token="punctuation">}</span>
            <span data-token="keyword">return</span> <span data-token="constant">true</span><span data-token="punctuation">;</span>
        <span data-token="punctuation">}</span>
    <span data-token="punctuation">}</span>

    <span data-token="comment">// --- Example Usage to make the script runnable ---</span>

    <span data-token="variable">$logger</span> <span data-token="operator">=</span> <span data-token="keyword">new</span> <span data-token="class">Logger</span><span data-token="punctuation">()</span><span data-token="punctuation">;</span>
    <span data-token="variable">$service</span> <span data-token="operator">=</span> <span data-token="keyword">new</span> <span data-token="class">DataService</span><span data-token="punctuation">(</span><span data-token="variable">$logger</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>

    <span data-token="comment">// Use the 'on' method to attach a listener (our "delegate")</span>
    <span data-token="variable">$service</span><span data-token="operator">-></span><span data-token="functionAndMethod">on</span><span data-token="punctuation">(</span><span data-token="keyword">function</span><span data-token="punctuation">(</span><span data-token="type">string</span> <span data-token="variable">$message</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
        <span data-token="functionAndMethod">echo</span> <span data-token="string">"Listener received: "</span> <span data-token="operator">.</span> <span data-token="variable">$message</span> <span data-token="operator">.</span> <span data-token="string">"\\n"</span><span data-token="punctuation">;</span>
        <span data-token="functionAndMethod">echo</span> <span data-token="string">"Status: "</span> <span data-token="operator">.</span> <span data-token="class">Status</span><span data-token="operator">::</span><span data-token="constant">Completed</span><span data-token="operator">-></span><span data-token="property">value</span> <span data-token="operator">.</span> <span data-token="string">"\\n"</span><span data-token="punctuation">;</span>
    <span data-token="punctuation">})</span><span data-token="punctuation">;</span>

    <span data-token="comment">// Use the Point class</span>
    <span data-token="variable">$point</span> <span data-token="operator">=</span> <span data-token="keyword">new</span> <span data-token="class">Point</span><span data-token="punctuation">(</span><span data-token="number">10</span><span data-token="punctuation">,</span> <span data-token="number">20</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
    <span data-token="functionAndMethod">echo</span> <span data-token="string">"Created a point at (</span><span data-token="punctuation">{</span><span data-token="variable">$point</span><span data-token="operator">-></span><span data-token="property">x</span><span data-token="punctuation">}</span><span data-token="string">, </span><span data-token="punctuation">{</span><span data-token="variable">$point</span><span data-token="operator">-></span><span data-token="property">y</span><span data-token="punctuation">}</span><span data-token="string">)</span><span data-token="constant">\\n</span><span data-token="string">"</span><span data-token="punctuation">;</span>

    <span data-token="comment">// Call the process method</span>
    <span data-token="variable">$service</span><span data-token="operator">-></span><span data-token="functionAndMethod">process</span><span data-token="punctuation">([</span><span data-token="string">'id'</span> <span data-token="operator">=&gt;</span> <span data-token="number">123</span><span data-token="punctuation">,</span> <span data-token="string">'payload'</span> <span data-token="operator">=&gt;</span> <span data-token="string">'some data'</span><span data-token="punctuation">])</span><span data-token="punctuation">;</span>
<span data-token="punctuation">}</span>
`;
