export const javaSnippet = `
<span data-token="keyword">package</span> <span data-token="namespace">com<span data-token="punctuation">.</span>myapp<span data-token="punctuation">.</span>core</span><span data-token="punctuation">;</span>

<span data-token="keyword">import</span> <span data-token="module">java<span data-token="punctuation">.</span>util<span data-token="punctuation">.</span>List</span><span data-token="punctuation">;</span>
<span data-token="keyword">import</span> <span data-token="module">java<span data-token="punctuation">.</span>util<span data-token="punctuation">.</span>ArrayList</span><span data-token="punctuation">;</span>

<span data-token="comment">// A public enum for status codes</span>
<span data-token="keyword">public</span> <span data-token="keyword">enum</span> <span data-token="enum">Status</span> <span data-token="punctuation">{</span>
    <span data-token="enumMember">PENDING</span><span data-token="punctuation">,</span>
    <span data-token="enumMember">COMPLETED</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// A functional interface serves as a delegate</span>
<span data-token="annotation">@FunctionalInterface</span>
<span data-token="keyword">interface</span> <span data-token="delegate">UpdateHandler</span> <span data-token="punctuation">{</span>
    <span data-token="type">void</span> <span data-token="functionAndMethod">onUpdate</span><span data-token="punctuation">(</span><span data-token="type">String</span> <span data-token="parameter">message</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// A generic interface</span>
<span data-token="keyword">public</span> <span data-token="keyword">interface</span> <span data-token="interface">IProcessable</span><span data-token="punctuation">&lt;</span><span data-token="typeParameter">T</span><span data-token="punctuation">&gt;</span> <span data-token="punctuation">{</span>
    <span data-token="type">void</span> <span data-token="functionAndMethod">process</span><span data-token="punctuation">(</span><span data-token="typeParameter">T</span> <span data-token="parameter">data</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// A record is an immutable data carrier, like a C# record struct</span>
<span data-token="keyword">public</span> <span data-token="keyword">record</span> <span data-token="struct">Point</span><span data-token="punctuation">(</span><span data-token="type">int</span> <span data-token="fieldAndAttribute">x</span><span data-token="punctuation">,</span> <span data-token="type">int</span> <span data-token="fieldAndAttribute">y</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span> <span data-token="punctuation">}</span>

<span data-token="keyword">public</span> <span data-token="keyword">class</span> <span data-token="class">DataService</span> <span data-token="keyword">implements</span> <span data-token="interface">IProcessable</span><span data-token="punctuation">&lt;</span><span data-token="type">String</span><span data-token="punctuation">&gt;</span> <span data-token="punctuation">{</span>
    <span data-token="keyword">private</span> <span data-token="keyword">final</span> <span data-token="type">String</span> <span data-token="propertyReadOnly">name</span> <span data-token="operator">=</span> <span data-token="string">"DataService"</span><span data-token="punctuation">;</span>
    <span data-token="keyword">public</span> <span data-token="keyword">static</span> <span data-token="keyword">final</span> <span data-token="type">double</span> <span data-token="constant">PI</span> <span data-token="operator">=</span> <span data-token="number">3.14159</span><span data-token="punctuation">;</span>
    
    <span data-token="comment">// Simulating an event with a list of listeners (delegates)</span>
    <span data-token="keyword">private</span> <span data-token="type">List</span><span data-token="punctuation">&lt;</span><span data-token="delegate">UpdateHandler</span><span data-token="punctuation">&gt;</span> <span data-token="event">updateListeners</span> <span data-token="operator">=</span> <span data-token="keyword">new</span> <span data-token="class">ArrayList</span><span data-token="punctuation">&lt;</span><span data-token="punctuation">&gt;</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
    
    <span data-token="annotation">@Override</span>
    <span data-token="keyword">public</span> <span data-token="type">void</span> <span data-token="functionAndMethod">process</span><span data-token="punctuation">(</span><span data-token="type">String</span> <span data-token="parameter">data</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
        <span data-token="comment">// Using a Text Block (verbatim string)</span>
        <span data-token="type">String</span> <span data-token="variable">logMessage</span> <span data-token="operator">=</span> <span data-token="stringVerbatim">"""
            Processing data: "%s"
            Service: %s
            """</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">formatted</span><span data-token="punctuation">(</span><span data-token="parameter">data</span><span data-token="punctuation">,</span> <span data-token="keyword">this</span><span data-token="punctuation">.</span><span data-token="propertyReadOnly">name</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
        
        <span data-token="keyword">for</span> <span data-token="punctuation">(</span><span data-token="delegate">UpdateHandler</span> <span data-token="variable">handler</span> <span data-token="punctuation">:</span> <span data-token="event">updateListeners</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
            <span data-token="variable">handler</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">onUpdate</span><span data-token="punctuation">(</span><span data-token="variable">logMessage</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
        <span data-token="punctuation">}</span>
    <span data-token="punctuation">}</span>
    <span data-token="text">This is some plain text.</span>
<span data-token="punctuation">}</span>
`;