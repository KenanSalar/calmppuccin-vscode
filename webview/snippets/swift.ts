export const swiftSnippet = `
<span data-token="keyword">import</span> <span data-token="module">Foundation</span>

<span data-token="comment">// A type alias for a closure, which acts as a delegate</span>
<span data-token="keyword">typealias</span> <span data-token="delegate">UpdateHandler</span> <span data-token="operator">=</span> <span data-token="punctuation">(</span><span data-token="parameter">_</span> <span data-token="parameter">message</span><span data-token="punctuation">:</span> <span data-token="type">String</span><span data-token="punctuation">)</span> <span data-token="operator">-&gt;</span> <span data-token="type">Void</span>

<span data-token="comment">// An enum with associated values</span>
<span data-token="keyword">enum</span> <span data-token="enum">Status</span> <span data-token="punctuation">{</span>
    <span data-token="keyword">case</span> <span data-token="enumMember">pending</span>
    <span data-token="keyword">case</span> <span data-token="enumMember">completed</span><span data-token="punctuation">(</span><span data-token="property">at</span><span data-token="punctuation">:</span> <span data-token="type">Date</span><span data-token="punctuation">)</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// A protocol is Swift's equivalent of an interface</span>
<span data-token="keyword">protocol</span> <span data-token="interface">Processable</span><span data-token="punctuation">&lt;</span><span data-token="typeParameter">T</span><span data-token="punctuation">&gt;</span> <span data-token="punctuation">{</span>
    <span data-token="keyword">func</span> <span data-token="functionAndMethod">process</span><span data-token="punctuation">(</span><span data-token="parameter">data</span><span data-token="punctuation">:</span> <span data-token="typeParameter">T</span><span data-token="punctuation">)</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// A struct for a Point</span>
<span data-token="keyword">struct</span> <span data-token="struct">Point</span> <span data-token="punctuation">{</span>
    <span data-token="keyword">var</span> <span data-token="fieldAndAttribute">x</span><span data-token="punctuation">:</span> <span data-token="type">Int</span>
    <span data-token="keyword">var</span> <span data-token="fieldAndAttribute">y</span><span data-token="punctuation">:</span> <span data-token="type">Int</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// Operator overloading via an extension</span>
<span data-token="keyword">extension</span> <span data-token="struct">Point</span> <span data-token="punctuation">{</span>
    <span data-token="keyword">static</span> <span data-token="keyword">func</span> <span data-token="operatorOverload">+</span><span data-token="punctuation">(</span><span data-token="parameter">lhs</span><span data-token="punctuation">:</span> <span data-token="struct">Point</span><span data-token="punctuation">,</span> <span data-token="parameter">rhs</span><span data-token="punctuation">:</span> <span data-token="struct">Point</span><span data-token="punctuation">)</span> <span data-token="operator">-&gt;</span> <span data-token="struct">Point</span> <span data-token="punctuation">{</span>
        <span data-token="keyword">return</span> <span data-token="struct">Point</span><span data-token="punctuation">(</span><span data-token="fieldAndAttribute">x</span><span data-token="punctuation">:</span> <span data-token="parameter">lhs</span><span data-token="punctuation">.</span><span data-token="fieldAndAttribute">x</span> <span data-token="operator">+</span> <span data-token="parameter">rhs</span><span data-token="punctuation">.</span><span data-token="fieldAndAttribute">x</span><span data-token="punctuation">,</span> <span data-token="fieldAndAttribute">y</span><span data-token="punctuation">:</span> <span data-token="parameter">lhs</span><span data-token="punctuation">.</span><span data-token="fieldAndAttribute">y</span> <span data-token="operator">+</span> <span data-token="parameter">rhs</span><span data-token="punctuation">.</span><span data-token="fieldAndAttribute">y</span><span data-token="punctuation">)</span>
    <span data-token="punctuation">}</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// Attributes are used as decorators</span>
<span data-token="annotation">@main</span>
<span data-token="keyword">class</span> <span data-token="class">App</span> <span data-token="punctuation">{</span>
    <span data-token="comment">// A read-only property</span>
    <span data-token="keyword">let</span> <span data-token="propertyReadOnly">id</span><span data-token="punctuation">:</span> <span data-token="type">UUID</span> <span data-token="operator">=</span> <span data-token="class">UUID</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span>
    <span data-token="comment">// A property to hold our event handler</span>
    <span data-token="keyword">var</span> <span data-token="event">onUpdate</span><span data-token="punctuation">:</span> <span data-token="delegate">UpdateHandler</span><span data-token="operator">?</span>
    
    <span data-token="keyword">static</span> <span data-token="keyword">func</span> <span data-token="functionAndMethod">main</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
        <span data-token="keyword">let</span> <span data-token="variable">p1</span> <span data-token="operator">=</span> <span data-token="struct">Point</span><span data-token="punctuation">(</span><span data-token="fieldAndAttribute">x</span><span data-token="punctuation">:</span> <span data-token="number">10</span><span data-token="punctuation">,</span> <span data-token="fieldAndAttribute">y</span><span data-token="punctuation">:</span> <span data-token="number">20</span><span data-token="punctuation">)</span>
        <span data-token="keyword">let</span> <span data-token="variable">p2</span> <span data-token="operator">=</span> <span data-token="struct">Point</span><span data-token="punctuation">(</span><span data-token="fieldAndAttribute">x</span><span data-token="punctuation">:</span> <span data-token="number">5</span><span data-token="punctuation">,</span> <span data-token="fieldAndAttribute">y</span><span data-token="punctuation">:</span> <span data-token="number">8</span><span data-token="punctuation">)</span>
        <span data-token="keyword">let</span> <span data-token="variable">result</span> <span data-token="operator">=</span> <span data-token="variable">p1</span> <span data-token="operator">+</span> <span data-token="variable">p2</span>
        
        <span data-token="comment">// Multi-line string with interpolation (verbatim)</span>
        <span data-token="keyword">let</span> <span data-token="variable">logMessage</span> <span data-token="operator">=</span> <span data-token="stringVerbatim">"""
            Result: (x: <span class="variable">\(result.x)</span>, y: <span class="variable">\(result.y)</span>)
            """</span>
        
        <span data-token="functionAndMethod">print</span><span data-token="punctuation">(</span><span data-token="variable">logMessage</span><span data-token="punctuation">)</span>
        <span data-token="text">This is some plain text.</span>
    <span data-token="punctuation">}</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// An extension method on String</span>
<span data-token="keyword">extension</span> <span data-token="type">String</span> <span data-token="punctuation">{</span>
    <span data-token="keyword">func</span> <span data-token="extensionMethod">shout</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span> <span data-token="operator">-&gt;</span> <span data-token="type">String</span> <span data-token="punctuation">{</span>
        <span data-token="keyword">return</span> <span data-token="keyword">self</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">uppercased</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span> <span data-token="operator">+</span> <span data-token="string">"!!!"</span>
    <span data-token="punctuation">}</span>
<span data-token="punctuation">}</span>
`;
