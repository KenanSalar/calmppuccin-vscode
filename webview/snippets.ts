// NEW: Define a type for our code snippets for better type safety.
export type CodeSnippets = {
  [language: string]: string;
};

// Central storage for all code snippets.
// This keeps the HTML markup separate from the main application logic.
export const codeSnippets: CodeSnippets = {
  csharp: `
<span data-token="keyword">namespace</span> <span data-token="namespace">MyApp<span data-token="operator">.</span>Core</span><span data-token="punctuation">;</span>
<span data-token="keyword">using</span> <span data-token="class">Module</span> <span data-token="operator">=</span> <span data-token="namespace">System</span><span data-token="operator">.</span><span data-token="class">Console</span><span data-token="punctuation">;</span>

<span data-token="keyword">public</span> <span data-token="keyword">enum</span> <span data-token="enum">Status</span> <span data-token="punctuation">{</span> <span data-token="enumMember">Pending</span><span data-token="punctuation">,</span> <span data-token="enumMember">Completed</span> <span data-token="punctuation">}</span>
<span data-token="keyword">public</span> <span data-token="keyword">delegate</span> <span data-token="keyword">void</span> <span data-token="delegate">UpdateHandler</span><span data-token="punctuation">(</span><span data-token="keyword">string</span> <span data-token="parameter">message</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>

<span data-token="keyword">public</span> <span data-token="keyword">interface</span> <span data-token="interface">IProcessable</span><span data-token="punctuation">&lt;</span><span data-token="typeParameter">T</span><span data-token="punctuation">&gt;</span> <span data-token="keyword">where</span> <span data-token="typeParameter">T</span> <span data-token="punctuation">:</span> <span data-token="keyword">struct</span>
<span data-token="punctuation">{</span>
    <span data-token="keyword">event</span> <span data-token="delegate">UpdateHandler</span><span data-token="operator">?</span> <span data-token="event">OnUpdate</span><span data-token="punctuation">;</span>
    <span data-token="typeParameter">T</span> <span data-token="property">Data</span> <span data-token="punctuation">{</span> <span data-token="keyword">get</span><span data-token="punctuation">;</span> <span data-token="punctuation">}</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// Using a record struct for an immutable data type</span>
<span data-token="keyword">public</span> <span data-token="keyword">readonly</span> <span data-token="keyword">record</span> <span data-token="keyword">struct</span> <span data-token="struct">Point</span><span data-token="punctuation">(</span><span data-token="keyword">int</span> <span data-token="parameter">X</span><span data-token="punctuation">,</span> <span data-token="keyword">int</span> <span data-token="parameter">Y</span><span data-token="punctuation">)</span>
<span data-token="punctuation">{</span>
    <span data-token="keyword">public</span> <span data-token="keyword">static</span> <span data-token="struct">Point</span> <span data-token="keyword">operator</span> <span data-token="operator">+</span><span data-token="punctuation">(</span><span data-token="struct">Point</span> <span data-token="parameter">a</span><span data-token="punctuation">,</span> <span data-token="struct">Point</span> <span data-token="parameter">b</span><span data-token="punctuation">)</span>
        <span data-token="operator">=></span> <span data-token="keyword">new</span><span data-token="punctuation">(</span><span data-token="parameter">a</span><span data-token="operator">.</span><span data-token="property">X</span> <span data-token="operator">+</span> <span data-token="parameter">b</span><span data-token="operator">.</span><span data-token="property">X</span><span data-token="punctuation">,</span> <span data-token="parameter">a</span><span data-token="operator">.</span><span data-token="property">Y</span> <span data-token="operator">+</span> <span data-token="parameter">b</span><span data-token="operator">.</span><span data-token="property">Y</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
<span data-token="punctuation">}</span>

<span data-token="keyword">public</span> <span data-token="keyword">class</span> <span data-token="class">Calculator</span>
<span data-token="punctuation">{</span>
    <span data-token="keyword">public</span> <span data-token="keyword">void</span> <span data-token="functionAndMethod">RunExample</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span>
    <span data-token="punctuation">{</span>
        <span data-token="comment">// Two instances of the Point struct</span>
        <span data-token="keyword">var</span> <span data-token="variable">point1</span> <span data-token="operator">=</span> <span data-token="keyword">new</span> <span data-token="struct">Point</span><span data-token="punctuation">(</span><span data-token="number">10</span><span data-token="punctuation">,</span> <span data-token="number">20</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
        <span data-token="keyword">var</span> <span data-token="variable">point2</span> <span data-token="operator">=</span> <span data-token="keyword">new</span> <span data-token="struct">Point</span><span data-token="punctuation">(</span><span data-token="number">5</span><span data-token="punctuation">,</span> <span data-token="number">8</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>

        <span data-token="comment">// Using the overloaded '+' operator</span>
        <span data-token="struct">Point</span> <span data-token="variable">result</span> <span data-token="operator">=</span> <span data-token="variable">point1</span> <span data-token="operatorOverload">+</span> <span data-token="variable">point2</span><span data-token="punctuation">;</span>

        <span data-token="class">Module</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">WriteLine</span><span data-token="punctuation">(</span><span data-token="stringVerbatim">$"Result: X=</span><span data-token="punctuation">{</span><span data-token="variable">result</span><span data-token="punctuation">.</span><span data-token="property">X</span><span data-token="punctuation">}</span><span data-token="stringVerbatim">, Y=</span><span data-token="punctuation">{</span><span data-token="variable">result</span><span data-token="punctuation">.</span><span data-token="property">Y</span><span data-token="punctuation">}</span><span data-token="stringVerbatim">"</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
    <span data-token="punctuation">}</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// Using primary constructors for dependency injection</span>
<span data-token="keyword">public</span> <span data-token="keyword">class</span> <span data-token="class">DataService</span><span data-token="punctuation">&lt;</span><span data-token="typeParameter">T</span><span data-token="punctuation">&gt;</span><span data-token="punctuation">(</span><span data-token="interface">ILogger</span> <span data-token="parameter">logger</span><span data-token="punctuation">)</span> <span data-token="keyword">where</span> <span data-token="typeParameter">T</span> <span data-token="punctuation">:</span> <span data-token="keyword">struct</span>
<span data-token="punctuation">{</span>
    <span data-token="keyword">private readonly</span> <span data-token="struct">Guid</span> <span data-token="fieldAndAttribute">_id</span> <span data-token="operator">=</span> <span data-token="struct">Guid<span data-token="punctuation">.</span><span data-token="functionAndMethod">NewGuid</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
    <span data-token="keyword">public</span> <span data-token="keyword">required</span> <span data-token="keyword">string</span> <span data-token="property">Name</span> <span data-token="punctuation">{</span> <span data-token="keyword">get</span><span data-token="punctuation">;</span> <span data-token="keyword">init</span><span data-token="punctuation">;</span> <span data-token="punctuation">}</span>

    <span data-token="keyword">public</span> <span data-token="keyword">void</span> <span data-token="functionAndMethod">Process</span><span data-token="punctuation">(</span><span data-token="typeParameter">T</span><span data-token="operator">?</span> <span data-token="parameter">data</span><span data-token="punctuation">)</span>
    <span data-token="punctuation">{</span>
        <span data-token="comment">// Using extension method</span>
        <span data-token="parameter">logger</span><span data-token="punctuation">.</span><span data-token="extensionMethod">GetTypeName</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>

        <span data-token="keyword">const</span> <span data-token="keyword">double</span> <span data-token="constant">PI</span> <span data-token="operator">=</span> <span data-token="number">3.14</span><span data-token="punctuation">;</span>
        <span data-token="keyword">var</span> <span data-token="variable">message</span> <span data-token="operator">=</span> <span data-token="parameter">data</span> <span data-token="operator">is</span> <span data-token="operator">not</span> <span data-token="constant">null</span>
            <span data-token="operator">?</span> <span data-token="keyword">this</span><span data-token="operator">.</span><span data-token="extensionMethod">GetTypeName</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span>
            <span data-token="operator">:</span> <span data-token="string">"No data"</span><span data-token="punctuation">;</span>
        
        <span data-token="comment">// Using a raw, interpolated string literal</span>
        <span data-token="keyword">var</span> <span data-token="variable">log</span> <span data-token="operator">=</span> <span data-token="string">$$"""
            Processing "</span><span data-token="punctuation">{</span><span data-token="variable">message</span><span data-token="punctuation">}</span><span data-token="string">"
            ID: </span><span data-token="punctuation">{</span><span data-token="fieldAndAttribute">_id</span><span data-token="punctuation">}</span><span data-token="string">
            PI: </span><span data-token="punctuation">{</span><span data-token="constant">PI</span><span data-token="punctuation">}</span><span data-token="string">
            """</span><span data-token="punctuation">;</span>
        
        <span data-token="comment">// Using a verbatim string literal</span>
        <span data-token="keyword">string</span><span data-token="operator">?</span> <span data-token="variable">verbatim</span> <span data-token="operator">=</span> <span data-token="stringVerbatim">@"C:\Path\To\File.txt"</span><span data-token="punctuation">;</span>
        
        <span data-token="comment">// Using string escape character</span>
        <span data-token="class">Module</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">WriteLine</span><span data-token="punctuation">(</span><span data-token="string">"C:</span><span data-token="constant">\\</span><span data-token="string">Path</span><span data-token="constant">\\</span><span data-token="string">To</span><span data-token="constant">\\</span><span data-token="string">File.txt"</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>

        <span data-token="class">Module</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">WriteLine</span><span data-token="punctuation">(</span><span data-token="variable">log</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
        <span data-token="class">Module</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">WriteLine</span><span data-token="punctuation">(</span><span data-token="variable">verbatim</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
    <span data-token="punctuation">}</span>

<span data-token="punctuation">[</span><span data-token="namespace">System</span><span data-token="operator">.</span><span data-token="namespace">Diagnostics</span><span data-token="operator">.</span><span data-token="namespace">CodeAnalysis</span><span data-token="operator">.</span><span data-token="class">ExcludeFromCodeCoverage</span><span data-token="punctuation">]</span>
<span data-token="keyword">public</span> <span data-token="keyword">static</span> <span data-token="keyword">class</span> <span data-token="class">ObjectExtensions</span>
<span data-token="punctuation">{</span>
    <span data-token="keyword">public</span> <span data-token="keyword">static</span> <span data-token="keyword">string</span> <span data-token="extensionMethod">GetTypeName</span><span data-token="punctuation">(</span><span data-token="keyword">this</span> <span data-token="keyword">object</span> <span data-token="parameter">_</span><span data-token="punctuation">)</span>
        <span data-token="operator">=></span> <span data-token="string">"System.Object"</span><span data-token="punctuation">;</span>
<span data-token="punctuation">}</span>
`,
  python: `
<span data-token="keyword">from</span> <span data-token="namespace">enum</span> <span data-token="keyword">import</span> <span data-token="enum">Enum</span>
<span data-token="keyword">from</span> <span data-token="namespace">dataclasses</span> <span data-token="keyword">import</span> <span data-token="function">dataclass</span>
<span data-token="keyword">from</span> <span data-token="namespace">typing</span> <span data-token="keyword">import</span> <span data-token="class">TypeVar</span><span data-token="punctuation">,</span> <span data-token="class">Generic</span>

<span data-token="comment"># Using an Enum for status codes</span>
<span data-token="keyword">class</span> <span data-token="enum">Status</span><span data-token="punctuation">(</span><span data-token="class">Enum</span><span data-token="punctuation">)</span><span data-token="punctuation">:</span>
    <span data-token="enumMember">PENDING</span> <span data-token="operator">=</span> <span data-token="string">'pending'</span>
    <span data-token="enumMember">COMPLETED</span> <span data-token="operator">=</span> <span data-token="string">'completed'</span>

<span data-token="comment"># A TypeVar for generic programming (equivalent to C#'s <T>)</span>
<span data-token="typeParameter">T</span> <span data-token="operator">=</span> <span data-token="class">TypeVar</span><span data-token="punctuation">(</span><span data-token="string">'T'</span><span data-token="punctuation">)</span>

<span data-token="comment"># Using a decorator (serves as an "annotation")</span>
<span data-token="annotation">@dataclass</span><span data-token="punctuation">(</span><span data-token="parameter">frozen</span><span data-token="operator">=</span><span data-token="constant">True</span><span data-token="punctuation">)</span>
<span data-token="keyword">class</span> <span data-token="struct">Point</span><span data-token="punctuation">:</span>
    <span data-token="fieldAndAttribute">x</span><span data-token="punctuation">:</span> <span data-token="class">int</span>
    <span data-token="fieldAndAttribute">y</span><span data-token="punctuation">:</span> <span data-token="class">int</span>

    <span data-token="comment"># Overloading the '+' operator</span>
    <span data-token="keyword">def</span> <span data-token="operatorOverload">__add__</span><span data-token="punctuation">(</span><span data-token="variable">self</span><span data-token="punctuation">,</span> <span data-token="parameter">other</span><span data-token="punctuation">)</span><span data-token="punctuation">:</span>
        <span data-token="keyword">return</span> <span data-token="class">Point</span><span data-token="punctuation">(</span><span data-token="variable">self</span><span data-token="punctuation">.</span><span data-token="fieldAndAttribute">x</span> <span data-token="operator">+</span> <span data-token="parameter">other</span><span data-token="punctuation">.</span><span data-token="fieldAndAttribute">x</span><span data-token="punctuation">,</span> <span data-token="variable">self</span><span data-token="punctuation">.</span><span data-token="fieldAndAttribute">y</span> <span data-token="operator">+</span> <span data-token="parameter">other</span><span data-token="punctuation">.</span><span data-token="fieldAndAttribute">y</span><span data-token="punctuation">)</span>

<span data-token="comment"># Simulating an "event" system</span>
<span data-token="keyword">class</span> <span data-token="class">EventManager</span><span data-token="punctuation">:</span>
    <span data-token="keyword">def</span> <span data-token="functionAndMethod">__init__</span><span data-token="punctuation">(</span><span data-token="variable">self</span><span data-token="punctuation">)</span><span data-token="punctuation">:</span>
        <span data-token="comment"># A delegate is a callable function reference</span>
        <span data-token="variable">self</span><span data-token="punctuation">.</span><span data-token="delegate">_handlers</span> <span data-token="operator">=</span> <span data-token="punctuation">[</span><span data-token="punctuation">]</span>

    <span data-token="keyword">def</span> <span data-token="event">on_update</span><span data-token="punctuation">(</span><span data-token="variable">self</span><span data-token="punctuation">,</span> <span data-token="parameter">handler</span><span data-token="punctuation">)</span><span data-token="punctuation">:</span>
        <span data-token="variable">self</span><span data-token="punctuation">.</span><span data-token="delegate">_handlers</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">append</span><span data-token="punctuation">(</span><span data-token="parameter">handler</span><span data-token="punctuation">)</span>

<span data-token="keyword">class</span> <span data-token="class">DataProcessor</span><span data-token="punctuation">(</span><span data-token="class">Generic</span><span data-token="punctuation">[</span><span data-token="typeParameter">T</span><span data-token="punctuation">]</span><span data-token="punctuation">)</span><span data-token="punctuation">:</span>
    <span data-token="keyword">def</span> <span data-token="functionAndMethod">__init__</span><span data-token="punctuation">(</span><span data-token="variable">self</span><span data-token="punctuation">)</span><span data-token="punctuation">:</span>
        <span data-token="variable">self</span><span data-token="punctuation">.</span><span data-token="fieldAndAttribute">_version</span> <span data-token="operator">=</span> <span data-token="string">"1.0"</span>

    <span data-token="annotation">@property</span>
    <span data-token="keyword">def</span> <span data-token="propertyReadOnly">version</span><span data-token="punctuation">(</span><span data-token="variable">self</span><span data-token="punctuation">)</span><span data-token="punctuation">:</span>
        <span data-token="comment"># This is a read-only property</span>
        <span data-token="keyword">return</span> <span data-token="variable">self</span><span data-token="punctuation">.</span><span data-token="fieldAndAttribute">_version</span>

<span data-token="comment"># Example usage</span>
<span data-token="variable">point1</span> <span data-token="operator">=</span> <span data-token="class">Point</span><span data-token="punctuation">(</span><span data-token="number">10</span><span data-token="punctuation">,</span> <span data-token="number">20</span><span data-token="punctuation">)</span>
<span data-token="variable">point2</span> <span data-token="operator">=</span> <span data-token="class">Point</span><span data-token="punctuation">(</span><span data-token="number">5</span><span data-token="punctuation">,</span> <span data-token="number">8</span><span data-token="punctuation">)</span>
<span data-token="variable">result</span> <span data-token="operator">=</span> <span data-token="variable">point1</span> <span data-token="operator">+</span> <span data-token="variable">point2</span>  <span data-token="comment"># Uses the overloaded operator</span>

<span data-token="constant">PI</span> <span data-token="operator">=</span> <span data-token="number">3.14159</span>
<span data-token="keyword">print</span><span data-token="punctuation">(</span><span data-token="stringVerbatim">f"Result: X=</span><span data-token="punctuation">{</span><span data-token="variable">result</span><span data-token="punctuation">.</span><span data-token="fieldAndAttribute">x</span><span data-token="punctuation">}</span><span data-token="stringVerbatim">, Y=</span><span data-token="punctuation">{</span><span data-token="variable">result</span><span data-token="punctuation">.</span><span data-token="fieldAndAttribute">y</span><span data-token="punctuation">}</span><span data-token="stringVerbatim">"</span><span data-token="punctuation">)</span>
<span data-token="text">This is some plain text</span><span data-token="punctuation">.</span>
`,
};
