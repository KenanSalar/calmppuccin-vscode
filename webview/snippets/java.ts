export const javaSnippet = `
<span data-token="keyword">package</span> <span data-token="namespace">com</span><span data-token="punctuation">.</span><span data-token="namespace">myapp</span><span data-token="punctuation">.</span><span data-token="namespace">core</span><span data-token="punctuation">;</span>

<span data-token="keyword">import</span> <span data-token="namespace">java</span><span data-token="punctuation">.</span><span data-token="namespace">util</span><span data-token="punctuation">.</span><span data-token="interface">List</span><span data-token="punctuation">;</span>
<span data-token="keyword">import</span> <span data-token="namespace">java</span><span data-token="punctuation">.</span><span data-token="namespace">util</span><span data-token="punctuation">.</span><span data-token="class">ArrayList</span><span data-token="punctuation">;</span>

<span data-token="comment">// A public enum for status codes</span>
<span data-token="keyword">public</span> <span data-token="keyword">enum</span> <span data-token="enum">Status</span> <span data-token="punctuation">{</span>
    <span data-token="enumMember">PENDING</span><span data-token="punctuation">,</span>
    <span data-token="enumMember">COMPLETED</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// A functional interface serves as a delegate</span>
<span data-token="annotation">@FunctionalInterface</span>
<span data-token="keyword">interface</span> <span data-token="interface">UpdateHandler</span> <span data-token="punctuation">{</span>
    <span data-token="type">void</span> <span data-token="functionAndMethod">onUpdate</span><span data-token="punctuation">(</span><span data-token="class">String</span> <span data-token="parameter">message</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// A generic interface</span>
<span data-token="keyword">public</span> <span data-token="keyword">interface</span> <span data-token="interface">IProcessable</span><span data-token="punctuation">&lt;</span><span data-token="typeParameter">T</span><span data-token="punctuation">&gt;</span> <span data-token="punctuation">{</span>
    <span data-token="type">void</span> <span data-token="functionAndMethod">process</span><span data-token="punctuation">(</span><span data-token="typeParameter">T</span> <span data-token="parameter">data</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// A record is an immutable data carrier, like a C# record class or record struct</span>
<span data-token="keyword">public</span> <span data-token="keyword">record</span> <span data-token="class">Point</span><span data-token="punctuation">(</span><span data-token="type">int</span> <span data-token="property">x</span><span data-token="punctuation">,</span> <span data-token="type">int</span> <span data-token="property">y</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span> <span data-token="punctuation">}</span>

<span data-token="keyword">public</span> <span data-token="keyword">class</span> <span data-token="class">DataService</span> <span data-token="keyword">implements</span> <span data-token="interface">IProcessable</span><span data-token="punctuation">&lt;</span><span data-token="class">String</span><span data-token="punctuation">&gt;</span> <span data-token="punctuation">{</span>
    <span data-token="keyword">private</span> <span data-token="keyword">final</span> <span data-token="class">String</span> <span data-token="propertyReadOnly">name</span> <span data-token="operator">=</span> <span data-token="string">"DataService"</span><span data-token="punctuation">;</span>
    <span data-token="keyword">public</span> <span data-token="keyword">static</span> <span data-token="keyword">final</span> <span data-token="type">double</span> <span data-token="propertyReadOnly">PI</span> <span data-token="operator">=</span> <span data-token="number">3.14159</span><span data-token="punctuation">;</span>
    
    <span data-token="comment">// Simulating an event with a list of listeners (delegates)</span>
    <span data-token="keyword">private</span> <span data-token="interface">List</span><span data-token="punctuation">&lt;</span><span data-token="interface">UpdateHandler</span><span data-token="punctuation">&gt;</span> <span data-token="property">updateListeners</span> <span data-token="operator">=</span> <span data-token="keyword">new</span> <span data-token="class">ArrayList</span><span data-token="punctuation">&lt;</span><span data-token="punctuation">&gt;</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
    
    <span data-token="annotation">@Override</span>
    <span data-token="keyword">public</span> <span data-token="type">void</span> <span data-token="functionAndMethod">process</span><span data-token="punctuation">(</span><span data-token="class">String</span> <span data-token="parameter">data</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
        <span data-token="comment">// Using a Text Block</span>
        <span data-token="class">String</span> <span data-token="variable">logMessage</span> <span data-token="operator">=</span> <span data-token="string">"""
            Processing data: "%s"
            Service: %s
            """</span><span data-token="operator">.</span><span data-token="functionAndMethod">formatted</span><span data-token="punctuation">(</span><span data-token="parameter">data</span><span data-token="punctuation">,</span> <span data-token="keyword">this</span><span data-token="operator">.</span><span data-token="propertyReadOnly">name</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
        
        <span data-token="keyword">for</span> <span data-token="punctuation">(</span><span data-token="interface">UpdateHandler</span> <span data-token="variable">handler</span> <span data-token="punctuation">:</span> <span data-token="property">updateListeners</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
            <span data-token="variable">handler</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">onUpdate</span><span data-token="punctuation">(</span><span data-token="variable">logMessage</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
        <span data-token="punctuation">}</span>
    <span data-token="punctuation">}</span>
<span data-token="punctuation">}</span>
`;