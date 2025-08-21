export const rubySnippet = `
<span data-token="comment"># "Modules" in Ruby are used as "namespaces"</span>
<span data-token="keyword">module</span> <span data-token="module">DataServices</span>
  <span data-token="comment"># "Enums" can be created with a module and constants</span>
  <span data-token="keyword">module</span> <span data-token="enum">Status</span>
    <span data-token="enumMember">PENDING</span> <span data-token="operator">=</span> <span data-token="string">"pending"</span>
    <span data-token="enumMember">COMPLETED</span> <span data-token="operator">=</span> <span data-token="string">"completed"</span>
  <span data-token="keyword">end</span>

  <span data-token="comment"># An "interface" is a convention, often a module with unimplemented methods</span>
  <span data-token="keyword">module</span> <span data-token="interface">IProcessable</span>
    <span data-token="keyword">def</span> <span data-token="functionAndMethod">process</span><span data-token="punctuation">(</span><span data-token="parameter">data</span><span data-token="punctuation">)</span>
      <span data-token="keyword">raise</span> <span data-token="class">NotImplementedError</span><span data-token="punctuation">,</span> <span data-token="string">"#{self.class} must implement the 'process' method"</span>
    <span data-token="keyword">end</span>
  <span data-token="keyword">end</span>

  <span data-token="comment"># A "struct" is a simple data-holding class</span>
  <span data-token="struct">Point</span> <span data-token="operator">=</span> <span data-token="class">Struct</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">new</span><span data-token="punctuation">(</span><span data-token="punctuation">:</span><span data-token="fieldAndAttribute">x</span><span data-token="punctuation">,</span> <span data-token="punctuation">:</span><span data-token="fieldAndAttribute">y</span><span data-token="punctuation">)</span> <span data-token="keyword">do</span>
    <span data-token="comment"># Operator Overloading</span>
    <span data-token="keyword">def</span> <span data-token="operatorOverload">+</span><span data-token="punctuation">(</span><span data-token="parameter">other</span><span data-token="punctuation">)</span>
      <span data-token="struct">Point</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">new</span><span data-token="punctuation">(</span><span data-token="keyword">self</span><span data-token="punctuation">.</span><span data-token="property">x</span> <span data-token="operator">+</span> <span data-token="parameter">other</span><span data-token="punctuation">.</span><span data-token="property">x</span><span data-token="punctuation">,</span> <span data-token="keyword">self</span><span data-token="punctuation">.</span><span data-token="property">y</span> <span data-token="operator">+</span> <span data-token="parameter">other</span><span data-token="punctuation">.</span><span data-token="property">y</span><span data-token="punctuation">)</span>
    <span data-token="keyword">end</span>
  <span data-token="keyword">end</span>

  <span data-token="keyword">class</span> <span data-token="class">Calculator</span>
    <span data-token="keyword">include</span> <span data-token="interface">IProcessable</span>
    <span data-token="keyword">attr_reader</span> <span data-token="punctuation">:</span><span data-token="propertyReadOnly">id</span> <span data-token="comment"># A read-only property</span>
    <span data-token="constant">VERSION</span> <span data-token="operator">=</span> <span data-token="string">'1.0'</span>

    <span data-token="keyword">def</span> <span data-token="functionAndMethod">initialize</span>
      <span data-token="variable">@id</span> <span data-token="operator">=</span> <span data-token-="number">123</span>
    <span data-token="keyword">end</span>

    <span data-token="comment"># Blocks act as "delegates" or "event" handlers</span>
    <span data-token="keyword">def</span> <span data-token="event">on_update</span><span data-token="punctuation">(</span><span data-token="operator">&</span><span data-token="delegate">block</span><span data-token="punctuation">)</span>
      <span data-token="delegate">block</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">call</span><span data-token="punctuation">(</span><span data-token="string">"Update triggered"</span><span data-token="punctuation">)</span> <span data-token="keyword">if</span> <span data-token="delegate">block</span>
    <span data-token="keyword">end</span>
  <span data-token="keyword">end</span>
<span data-token="keyword">end</span>

<span data-token="comment"># "Extension methods" via monkey-patching a core class</span>
<span data-token="keyword">class</span> <span data-token="type">String</span>
  <span data-token="keyword">def</span> <span data-token="extensionMethod">shout</span>
    <span data-token="keyword">self</span><span data-token="punctuation">.</span><span data-token="functionAndMethod">upcase</span> <span data-token="operator">+</span> <span data-token="string">"!!!"</span>
  <span data-token="keyword">end</span>
<span data-token="keyword">end</span>

<span data-token="variable">p1</span> <span data-token="operator">=</span> <span data-token-="module">DataServices</span><span data-token="operator">::</span><span data-token="struct">Point</span><span data-token="punctuation">.</span><span data-token-="functionAndMethod">new</span><span data-token-="punctuation">(</span><span data-token-="number">10</span><span data-token-="punctuation">,</span> <span data-token-="number">20</span><span data-token-="punctuation">)</span>
<span data-token-="variable">p2</span> <span data-token-="operator">=</span> <span data-token-="module">DataServices</span><span data-token-="operator">::</span><span data-token-="struct">Point</span><span data-token-="punctuation">.</span><span data-token-="functionAndMethod">new</span><span data-token-="punctuation">(</span><span data-token-="number">5</span><span data-token-="punctuation">,</span> <span data-token-="number">8.5</span><span data-token-="punctuation">)</span>
<span data-token-="variable">result</span> <span data-token-="operator">=</span> <span data-token-="variable">p1</span> <span data-token-="operator">+</span> <span data-token-="variable">p2</span>

<span data-token="comment"># A multi-line "verbatim" string using a heredoc</span>
<span data-token="variable">message</span> <span data-token="operator">=</span> <span data-token="stringVerbatim">&lt;&lt;~MESSAGE
  Processing with status: #{DataServices::Status::COMPLETED}
  Result: (#{result.x}, #{result.y})
MESSAGE</span>

<span data-token="text">This is some plain text.</span>
<span data-token="functionAndMethod">puts</span> <span data-token="variable">message</span><span data-token="punctuation">.</span><span data-token="extensionMethod">shout</span>
`;
