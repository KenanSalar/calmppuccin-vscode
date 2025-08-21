export const phpSnippet = `
<span data-token="keyword">&lt;?php</span>

<span data-token="keyword">namespace</span> <span data-token="namespace">App\\Core</span><span data-token="punctuation">;</span>

<span data-token="keyword">use</span> <span data-token="module">DateTime</span><span data-token="punctuation">;</span>
<span data-token="keyword">use</span> <span data-token="module">App\\Services\\Logger</span><span data-token="punctuation">;</span>

<span data-token="comment">// Attributes are the equivalent of decorators/annotations in PHP 8+</span>
<span data-token="attributeBracket">#[</span><span data-token="decorator">Attribute</span><span data-token="attributeBracket">]</span>
<span data-token="keyword">class</span> <span data-token="annotation">Route</span> <span data-token="punctuation">{</span>
    <span data-token="keyword">public</span> <span data-token="keyword">function</span> <span data-token="functionAndMethod">__construct</span><span data-token="punctuation">(</span><span data-token="keyword">public</span> <span data-token="type">string</span> <span data-token="parameter">$path</span><span data-token="punctuation">)</span> <span data-token="punctuation">{}</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// A backed Enum (PHP 8.1+)</span>
<span data-token="keyword">enum</span> <span data-token="enum">Status</span><span data-token="punctuation">:</span> <span data-token="type">string</span> <span data-token="punctuation">{</span>
    <span data-token="keyword">case</span> <span data-token="enumMember">Pending</span> <span data-token="operator">=</span> <span data-token="string">'pending'</span><span data-token="punctuation">;</span>
    <span data-token="keyword">case</span> <span data-token="enumMember">Completed</span> <span data-token="operator">=</span> <span data-token="string">'completed'</span><span data-token="punctuation">;</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// An interface for processable items</span>
<span data-token="keyword">interface</span> <span data-token="interface">IProcessable</span> <span data-token="punctuation">{</span>
    <span data-token="keyword">public</span> <span data-token="keyword">function</span> <span data-token="functionAndMethod">process</span><span data-token="punctuation">(</span><span data-token="type">array</span> <span data-token="parameter">$data</span><span data-token="punctuation">)</span><span data-token="punctuation">:</span> <span data-token="type">bool</span><span data-token="punctuation">;</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// A readonly class (PHP 8.2+) can serve as a struct/record</span>
<span data-token="keyword">final</span> <span data-token="keyword">class</span> <span data-token="struct">Point</span> <span data-token="punctuation">{</span>
    <span data-token="keyword">public</span> <span data-token="keyword">function</span> <span data-token="functionAndMethod">__construct</span><span data-token="punctuation">(</span>
        <span data-token="keyword">public</span> <span data-token="keyword">readonly</span> <span data-token="type">int</span> <span data-token="propertyReadOnly">$x</span><span data-token="punctuation">,</span>
        <span data-token="keyword">public</span> <span data-token="keyword">readonly</span> <span data-token="type">int</span> <span data-token="propertyReadOnly">$y</span>
    <span data-token="punctuation">)</span> <span data-token="punctuation">{}</span>
<span data-token="punctuation">}</span>

<span data-token="keyword">class</span> <span data-token="class">DataService</span> <span data-token="keyword">implements</span> <span data-token="interface">IProcessable</span> <span data-token="punctuation">{</span>
    <span data-token="keyword">public</span> <span data-token="keyword">const</span> <span data-token="constant">VERSION</span> <span data-token="operator">=</span> <span data-token="string">'1.0'</span><span data-token="punctuation">;</span>
    <span data-token="keyword">private</span> <span data-token="type">array</span> <span data-token="event">$listeners</span> <span data-token="operator">=</span> <span data-token="punctuation">[</span><span data-token="punctuation">]</span><span data-token="punctuation">;</span>
    
    <span data-token="comment">// Constructor property promotion</span>
    <span data-token="keyword">public</span> <span data-token="keyword">function</span> <span data-token="functionAndMethod">__construct</span><span data-token="punctuation">(</span><span data-token="keyword">private</span> <span data-token="type">Logger</span> <span data-token="fieldAndAttribute">$logger</span><span data-token="punctuation">)</span> <span data-token="punctuation">{}</span>

    <span data-token="comment">// A delegate is a 'callable' type</span>
    <span data-token="keyword">public</span> <span data-token="keyword">function</span> <span data-token="event">on</span><span data-token="punctuation">(</span><span data-token="type">callable</span> <span data-token="delegate">$listener</span><span data-token="punctuation">)</span><span data-token="punctuation">:</span> <span data-token="type">void</span> <span data-token="punctuation">{</span>
        <span data-token="keyword">this</span><span data-token="operator">-></span><span data-token="event">listeners</span><span data-token="punctuation">[</span><span data-token="punctuation">]</span> <span data-token="operator">=</span> <span data-token="delegate">$listener</span><span data-token="punctuation">;</span>
    <span data-token="punctuation">}</span>

    <span data-token="attributeBracket">#[</span><span data-token="annotation">Route</span><span data-token="punctuation">(</span><span data-token="parameter">path</span><span data-token="punctuation">:</span> <span data-token="string">'/process'</span><span data-token="punctuation">)</span><span data-token="attributeBracket">]</span>
    <span data-token="keyword">public</span> <span data-token="keyword">function</span> <span data-token="functionAndMethod">process</span><span data-token="punctuation">(</span><span data-token="type">array</span> <span data-token="parameter">$data</span><span data-token="punctuation">)</span><span data-token="punctuation">:</span> <span data-token="type">bool</span> <span data-token="punctuation">{</span>
        <span data-token="comment">// Heredoc for a verbatim multiline string</span>
        <span data-token="variable">$logMessage</span> <span data-token="operator">=</span> <span data-token="stringVerbatim">&lt;&lt;&lt;LOG
        Processing item with ID: <span data-token="variable">$</span><span data-token="string">{data["id"]}</span>
        LOG</span><span data-token="punctuation">;</span>

        <span data-token="keyword">foreach</span> <span data-token="punctuation">(</span><span data-token="keyword">this</span><span data-token="operator">-></span><span data-token="event">listeners</span> <span data-token="keyword">as</span> <span data-token="variable">$listener</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
            <span data-token="functionAndMethod">$listener</span><span data-token="punctuation">(</span><span data-token="variable">$logMessage</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
        <span data-token="punctuation">}</span>
        <span data-token="keyword">return</span> <span data-token="constant">true</span><span data-token="punctuation">;</span>
    <span data-token="punctuation">}</span>
<span data-token="punctuation">}</span>

<span data-token="text">This is some plain text.</span>
<span data-token="keyword">echo</span> <span data-token="class">DataService</span><span data-token="operator">::</span><span data-token="constant">VERSION</span> <span data-token="operator">.</span> <span data-token="string">"</span><span data-token="constant">\\n</span><span data-token="string">"</span><span data-token="punctuation">;</span>
`;
