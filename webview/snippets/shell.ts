export const shellSnippet = `
<span data-token="comment">#!/bin/bash</span>

<span data-token="comment"># A constant variable (readonly) represents a 'propertyReadOnly'</span>
<span data-token="keyword">readonly</span> <span data-token="variable">LOG_FILE</span><span data-token="operator">=</span><span data-token="string">"/var/log/app.log"</span>

<span data-token="comment"># Using an associative array to simulate an "enum"</span>
<span data-token="keyword">declare</span> <span data-token="constant">-A</span> <span data-token="variable">Status</span><span data-token="operator">=</span><span data-token="punctuation">(</span>
  <span data-token="punctuation">[</span><span data-token="fieldAndAttribute">Pending</span><span data-token="punctuation">]</span><span data-token="operator">=</span><span data-token="number">1</span>
  <span data-token="punctuation">[</span><span data-token="fieldAndAttribute">Completed</span><span data-token="punctuation">]</span><span data-token="operator">=</span><span data-token="number">2</span>
<span data-token="punctuation">)</span>

<span data-token="comment"># A function to process data. 'function' is a keyword.</span>
<span data-token="keyword">function</span> <span data-token="functionAndMethod">process_data</span><span data-token="punctuation">()</span> <span data-token="punctuation">{</span>
  <span data-token="comment"># A parameter passed to the function</span>
  <span data-token="keyword">local</span> <span data-token="variable">input_file</span><span data-token="operator">=</span><span data-token="parameter">&#36;1</span>

  <span data-token="comment"># A mutable variable</span>
  <span data-token="keyword">local</span> <span data-token="variable">line_count</span><span data-token="operator">=</span><span data-token="number">0</span>

  <span data-token="keyword">if</span> <span data-token="punctuation">[[</span> <span data-token="operator">-n</span> <span data-token="string">"</span><span data-token="variable">&#36;input_file</span><span data-token="string">"</span> <span data-token="punctuation">]]</span><span data-token="punctuation">;</span> <span data-token="keyword">then</span>
    <span data-token="comment"># String interpolation</span>
    <span data-token="keyword">local</span> <span data-token="variable">msg</span><span data-token="operator">=</span><span data-token="string">"Processing file: </span><span data-token="punctuation">&#36;{</span><span data-token="variable">input_file</span><span data-token="punctuation">}</span><span data-token="string"> with status </span><span data-token="punctuation">&#36;{</span><span data-token="variable">Status</span><span data-token="string">[Pending]</span><span data-token="punctuation">}</span><span data-token="string">"</span>
    <span data-token="functionAndMethod">echo</span> <span data-token="string">"</span><span data-token="variable">&#36;msg</span><span data-token="string">"</span>
    <span data-token="functionAndMethod">echo</span> <span data-token="string">"</span><span data-token="variable">&#36;msg</span><span data-token="string">"</span> <span data-token="operator">&gt;&gt;</span> <span data-token="string">"</span><span data-token="variable">&#36;LOG_FILE</span><span data-token="string">"</span>
  <span data-token="keyword">fi</span>

  <span data-token="comment"># A for loop, a common control structure</span>
  <span data-token="keyword">while</span> <span data-token="functionAndMethod">read</span> <span data-token="constant">-r</span> <span data-token="string">line</span><span data-token="punctuation">;</span> <span data-token="keyword">do</span>
    <span data-token="functionAndMethod">echo</span> <span data-token="string">"Read line: </span><span data-token="variable">&#36;line</span><span data-token="string">"</span>
    <span data-token="variable">line_count</span><span data-token="operator">=</span><span data-token="punctuation">&#36;((</span><span data-token="functionAndMethod">line_count</span> <span data-token="operator">+</span> <span data-token="number">1</span><span data-token="punctuation">))</span>
  <span data-token="keyword">done</span> <span data-token="operator">&lt;</span> <span data-token="string">"</span><span data-token="variable">&#36;input_file</span><span data-token="string">"</span>
<span data-token="punctuation">}</span>

<span data-token="comment"># A multi-line string using a heredoc</span>
<span data-token="functionAndMethod">cat</span> <span data-token="operator">&lt;&lt;</span><span data-token="string">'EOF'
This is a multi-line script info block.
Variables like $HOME are not expanded here.
EOF</span>

<span data-token="comment"># Create a dummy data file for the example to work</span>
<span data-token="functionAndMethod">echo</span> <span data-token="constant">-e</span> <span data-token="string">"first line\\nsecond line"</span> <span data-token="operator">&gt;</span> <span data-token="string">data.txt</span>

<span data-token="functionAndMethod">process_data</span> <span data-token="string">"data.txt"</span>
`;
