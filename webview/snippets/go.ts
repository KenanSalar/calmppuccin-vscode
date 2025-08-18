export const goSnippet = `
<span data-token="comment">/*
I recommend using the gopls language server and
adding this to your settings.json:

"gopls": {
  "ui.semanticTokens": false
}

*/</span>
<span data-token="keyword">package</span> <span data-token="namespace">main</span>

<span data-token="keyword">import</span> <span data-token="punctuation">(</span>
    <span data-token="string">"</span><span data-token="namespace"><u>fmt</u></span><span data-token="string">"</span>
    <span data-token="string">"</span><span data-token="namespace"><u>time</u></span><span data-token="string">"</span>
<span data-token="punctuation">)</span>

<span data-token="comment">// Using iota to create an enum for Status</span>
<span data-token="keyword">type</span> <span data-token="enum">Status</span> <span data-token="type">int</span>

<span data-token="keyword">const</span> <span data-token="punctuation">(</span>
    <span data-token="constant">Pending</span> <span data-token="type">Status</span> <span data-token="operator">=</span> <span data-token="constant">iota</span>
    <span data-token="constant">Completed</span>
<span data-token="punctuation">)</span>

<span data-token="comment">// A function type, similar to a delegate</span>
<span data-token="keyword">type</span> <span data-token="delegate">UpdateHandler</span> <span data-token="keyword">func</span><span data-token="punctuation">(</span><span data-token="variable">message</span> <span data-token="type">string</span><span data-token="punctuation">)</span>

<span data-token="comment">// An interface for processable items</span>
<span data-token="keyword">type</span> <span data-token="interface">IProcessable</span><span data-token="punctuation">[</span><span data-token="typeParameter">T</span> <span data-token="keyword">any</span><span data-token="punctuation">]</span> <span data-token="keyword">interface</span> <span data-token="punctuation">{</span>
    <span data-token="functionAndMethod">Process</span><span data-token="punctuation">(</span><span data-token="variable">data</span> <span data-token="typeParameter">T</span><span data-token="punctuation">)</span> <span data-token="keyword">error</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// A struct for a Point</span>
<span data-token="keyword">type</span> <span data-token="struct">Point</span> <span data-token="keyword">struct</span> <span data-token="punctuation">{</span>
    <span data-token="variable">X</span><span data-token="punctuation">,</span> <span data-token="variable">Y</span> <span data-token="type">int</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// A method on Point (Go doesn't have operator overloading)</span>
<span data-token="keyword">func</span> <span data-token="punctuation">(</span><span data-token="variable">p</span> <span data-token="struct">Point</span><span data-token="punctuation">)</span> <span data-token="functionAndMethod">Add</span><span data-token="punctuation">(</span><span data-token="parameter">other</span> <span data-token="struct">Point</span><span data-token="punctuation">)</span> <span data-token="struct">Point</span> <span data-token="punctuation">{</span>
    <span data-token="keyword">return</span> <span data-token="struct">Point</span><span data-token="punctuation">{</span><span data-token="variable">X</span><span data-token="punctuation">:</span> <span data-token="variable">p</span><span data-token="punctuation">.</span><span data-token="variable">X</span> <span data-token="operator">+</span> <span data-token="parameter">other</span><span data-token="punctuation">.</span><span data-token="variable">X</span><span data-token="punctuation">,</span> <span data-token="variable">Y</span><span data-token="punctuation">:</span> <span data-token="variable">p</span><span data-token="punctuation">.</span><span data-token="variable">Y</span> <span data-token="operator">+</span> <span data-token="parameter">other</span><span data-token="punctuation">.</span><span data-token="variable">Y</span><span data-token="punctuation">}</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// A class-like struct with an event channel</span>
<span data-token="keyword">type</span> <span data-token="struct">DataService</span> <span data-token="keyword">struct</span> <span data-token="punctuation">{</span>
    <span data-token="comment">// Struct tags are a form of annotation</span>
    <span data-token="variable">Name</span>        <span data-token="type">string</span>      <span data-token="string">\`json:"name"\`</span>
    <span data-token="event">UpdateEvent</span> <span data-token="keyword">chan</span> <span data-token="type">string</span> <span data-token="comment">// Using a channel for events</span>
<span data-token="punctuation">}</span>

<span data-token="keyword">func</span> <span data-token="functionAndMethod">main</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
    <span data-token="variable">service</span> <span data-token="operator">:=</span> <span data-token="operator">&</span><span data-token="struct">DataService</span><span data-token="punctuation">{</span>
        <span data-token="property">Name</span><span data-token="punctuation">:</span>        <span data-token="string">"Primary Service"</span><span data-token="punctuation">,</span>
        <span data-token="event">UpdateEvent</span><span data-token="punctuation">:</span> <span data-token="functionAndMethod">make</span><span data-token="punctuation">(</span><span data-token="keyword">chan</span> <span data-token="type">string</span><span data-token="punctuation">)</span><span data-token="punctuation">,</span>
    <span data-token="punctuation">}</span>

    <span data-token="comment">// A goroutine to listen for events</span>
    <span data-token="keyword">go</span> <span data-token="keyword">func</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
        <span data-token="keyword">for</span> <span data-token="variable">msg</span> <span data-token="operator">:=</span> <span data-token="keyword">range</span> <span data-token="variable">service</span><span data-token="punctuation">.</span><span data-token="event">UpdateEvent</span> <span data-token="punctuation">{</span>
            <span data-token="namespace">fmt</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">Println</span><span data-token="punctuation">(</span><span data-token="string">"Event Received:"</span><span data-token="punctuation">,</span> <span data-token="variable">msg</span><span data-token="punctuation">)</span>
        <span data-token="punctuation">}</span>
    <span data-token="punctuation">}</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span>

    <span data-token="variable">service</span><span data-token="punctuation">.</span><span data-token="event">UpdateEvent</span> <span data-token="operator">&lt;-</span> <span data-token="string">"Processing started"</span>

    <span data-token="variable">p1</span> <span data-token="operator">:=</span> <span data-token="struct">Point</span><span data-token="punctuation">{</span><span data-token="number">10</span><span data-token="punctuation">,</span> <span data-token="number">20</span><span data-token="punctuation">}</span>
    <span data-token="variable">p2</span> <span data-token="operator">:=</span> <span data-token="struct">Point</span><span data-token="punctuation">{</span><span data-token="number">5</span><span data-token="punctuation">,</span> <span data-token="number">8</span><span data-token="punctuation">}</span>
    <span data-token="variable">result</span> <span data-token="operator">:=</span> <span data-token="variable">p1</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">Add</span><span data-token="punctuation">(</span><span data-token="variable">p2</span><span data-token="punctuation">)</span>

    <span data-token="namespace">fmt</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">Printf</span><span data-token="punctuation">(</span><span data-token="string">\`Result: </span><span data-token="constant">%+v</span><span data-token="string">\`</span><span data-token="punctuation">,</span> <span data-token="variable">result</span><span data-token="punctuation">)</span>
    <span data-token="namespace">time</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">Sleep</span><span data-token="punctuation">(</span><span data-token="number">100</span> <span data-token="operator">*</span> <span data-token="namespace">time</span><span data-token="punctuation">.</span><span data-token="constant">Millisecond</span><span data-token="punctuation">)</span>
<span data-token="punctuation">}</span>
`;
