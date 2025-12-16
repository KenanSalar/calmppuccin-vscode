export const dartSnippet = `
<span data-token="keyword">import</span> <span data-token="string">'dart:async'</span><span data-token="punctuation">;</span>
<span data-token="keyword">import</span> <span data-token="string">'package:flutter/material.dart'</span><span data-token="punctuation">;</span>

<span data-token="comment">/// A function type alias for callbacks</span>
<span data-token="keyword">typedef</span> <span data-token="type">EventCallback</span><span data-token="punctuation">&lt;</span><span data-token="typeParameter">T</span><span data-token="punctuation">&gt;</span> <span data-token="operator">=</span> <span data-token="type">void</span> <span data-token="class">Function</span><span data-token="punctuation">(</span><span data-token="typeParameter">T</span> <span data-token="parameter">event</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>

<span data-token="comment">// Enhanced enum with fields and methods</span>
<span data-token="keyword">enum</span> <span data-token="enum">Status</span> <span data-token="punctuation">{</span>
  <span data-token="enumMember">pending</span><span data-token="punctuation">(</span><span data-token="string">'Waiting'</span><span data-token="punctuation">)</span><span data-token="punctuation">,</span>
  <span data-token="enumMember">active</span><span data-token="punctuation">(</span><span data-token="string">'Running'</span><span data-token="punctuation">)</span><span data-token="punctuation">,</span>
  <span data-token="enumMember">completed</span><span data-token="punctuation">(</span><span data-token="string">'Done'</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>

  <span data-token="keyword">const</span> <span data-token="enum">Status</span><span data-token="punctuation">(</span><span data-token="keyword">this</span><span data-token="operator">.</span><span data-token="fieldAndAttribute">label</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
  <span data-token="keyword">final</span> <span data-token="class">String</span> <span data-token="fieldAndAttribute">label</span><span data-token="punctuation">;</span>
<span data-token="punctuation">}</span>

<span data-token="comment">/// A mixin for logging capabilities</span>
<span data-token="keyword">mixin</span> <span data-token="class">Loggable</span> <span data-token="punctuation">{</span>
  <span data-token="type">void</span> <span data-token="functionAndMethod">log</span><span data-token="punctuation">(</span><span data-token="class">String</span> <span data-token="parameter">message</span><span data-token="punctuation">)</span> <span data-token="operator">=></span> <span data-token="functionAndMethod">print</span><span data-token="punctuation">(</span><span data-token="string">'[LOG] </span><span data-token="string">$</span><span data-token="parameter">message</span><span data-token="string">'</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// Sealed class for pattern matching (Dart 3)</span>
<span data-token="keyword">sealed</span> <span data-token="keyword">class</span> <span data-token="class">Result</span><span data-token="punctuation">&lt;</span><span data-token="typeParameter">T</span><span data-token="punctuation">&gt;</span> <span data-token="punctuation">{</span>
  <span data-token="keyword">const</span> <span data-token="class">Result</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
<span data-token="punctuation">}</span>

<span data-token="keyword">final</span> <span data-token="keyword">class</span> <span data-token="class">Success</span><span data-token="punctuation">&lt;</span><span data-token="typeParameter">T</span><span data-token="punctuation">&gt;</span> <span data-token="keyword">extends</span> <span data-token="class">Result</span><span data-token="punctuation">&lt;</span><span data-token="typeParameter">T</span><span data-token="punctuation">&gt;</span> <span data-token="punctuation">{</span>
  <span data-token="keyword">const</span> <span data-token="class">Success</span><span data-token="punctuation">(</span><span data-token="keyword">this</span><span data-token="operator">.</span><span data-token="fieldAndAttribute">value</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
  <span data-token="keyword">final</span> <span data-token="typeParameter">T</span> <span data-token="fieldAndAttribute">value</span><span data-token="punctuation">;</span>
<span data-token="punctuation">}</span>

<span data-token="keyword">final</span> <span data-token="keyword">class</span> <span data-token="class">Failure</span><span data-token="punctuation">&lt;</span><span data-token="typeParameter">T</span><span data-token="punctuation">&gt;</span> <span data-token="keyword">extends</span> <span data-token="class">Result</span><span data-token="punctuation">&lt;</span><span data-token="typeParameter">T</span><span data-token="punctuation">&gt;</span> <span data-token="punctuation">{</span>
  <span data-token="keyword">const</span> <span data-token="class">Failure</span><span data-token="punctuation">(</span><span data-token="keyword">this</span><span data-token="operator">.</span><span data-token="fieldAndAttribute">error</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
  <span data-token="keyword">final</span> <span data-token="class">Exception</span> <span data-token="fieldAndAttribute">error</span><span data-token="punctuation">;</span>
<span data-token="punctuation">}</span>

<span data-token="comment">/// Extension methods on String</span>
<span data-token="keyword">extension</span> <span data-token="class">StringExt</span> <span data-token="keyword">on</span> <span data-token="class">String</span> <span data-token="punctuation">{</span>
  <span data-token="class">String</span> <span data-token="keyword">get</span> <span data-token="property">capitalized</span> <span data-token="operator">=></span> <span data-token="keyword">this</span><span data-token="punctuation">[</span><span data-token="number">0</span><span data-token="punctuation">]</span><span data-token="operator">.</span><span data-token="functionAndMethod">toUpperCase</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span> <span data-token="operator">+</span> <span data-token="functionAndMethod">substring</span><span data-token="punctuation">(</span><span data-token="number">1</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
<span data-token="punctuation">}</span>

<span data-token="comment">// Main service class with mixin</span>
<span data-token="keyword">class</span> <span data-token="class">DataService</span> <span data-token="keyword">with</span> <span data-token="class">Loggable</span> <span data-token="punctuation">{</span>
  <span data-token="keyword">static</span> <span data-token="keyword">const</span> <span data-token="class">String</span> <span data-token="constant">_tag</span> <span data-token="operator">=</span> <span data-token="string">'DataService'</span><span data-token="punctuation">;</span>
  <span data-token="keyword">late</span> <span data-token="keyword">final</span> <span data-token="class">String</span> <span data-token="fieldAndAttribute">_name</span><span data-token="punctuation">;</span>
  <span data-token="class">int</span><span data-token="operator">?</span> <span data-token="fieldAndAttribute">_counter</span><span data-token="punctuation">;</span>

  <span data-token="class">DataService</span><span data-token="punctuation">(</span><span data-token="punctuation">{</span><span data-token="keyword">required</span> <span data-token="class">String</span> <span data-token="parameter">name</span><span data-token="punctuation">}</span><span data-token="punctuation">)</span> <span data-token="operator">:</span> <span data-token="fieldAndAttribute">_name</span> <span data-token="operator">=</span> <span data-token="parameter">name</span><span data-token="punctuation">;</span>

  <span data-token="comment">// Factory constructor</span>
  <span data-token="keyword">factory</span> <span data-token="class">DataService</span><span data-token="operator">.</span><span data-token="functionAndMethod">create</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span> <span data-token="operator">=></span> <span data-token="class">DataService</span><span data-token="punctuation">(</span><span data-token="parameter">name</span><span data-token="operator">:</span> <span data-token="constant">_tag</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>

  <span data-token="comment">// Getter and setter</span>
  <span data-token="class">String</span> <span data-token="keyword">get</span> <span data-token="property">name</span> <span data-token="operator">=></span> <span data-token="fieldAndAttribute">_name</span><span data-token="punctuation">;</span>
  <span data-token="class">int</span> <span data-token="keyword">get</span> <span data-token="property">counter</span> <span data-token="operator">=></span> <span data-token="fieldAndAttribute">_counter</span> <span data-token="operator">??</span> <span data-token="number">0</span><span data-token="punctuation">;</span>
  <span data-token="keyword">set</span> <span data-token="property">counter</span><span data-token="punctuation">(</span><span data-token="class">int</span> <span data-token="parameter">value</span><span data-token="punctuation">)</span> <span data-token="operator">=></span> <span data-token="fieldAndAttribute">_counter</span> <span data-token="operator">=</span> <span data-token="parameter">value</span><span data-token="punctuation">;</span>

  <span data-token="comment">/// Fetches data asynchronously</span>
  <span data-token="class">Future</span><span data-token="punctuation">&lt;</span><span data-token="class">Result</span><span data-token="punctuation">&lt;</span><span data-token="class">String</span><span data-token="punctuation">&gt;</span><span data-token="punctuation">&gt;</span> <span data-token="functionAndMethod">fetch</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span> <span data-token="keyword">async</span> <span data-token="punctuation">{</span>
    <span data-token="keyword">try</span> <span data-token="punctuation">{</span>
      <span data-token="keyword">await</span> <span data-token="class">Future</span><span data-token="operator">.</span><span data-token="functionAndMethod">delayed</span><span data-token="punctuation">(</span><span data-token="keyword">const</span> <span data-token="class">Duration</span><span data-token="punctuation">(</span><span data-token="parameter">seconds</span><span data-token="operator">:</span> <span data-token="number">1</span><span data-token="punctuation">)</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
      <span data-token="keyword">return</span> <span data-token="class">Success</span><span data-token="punctuation">(</span><span data-token="string">'Data for </span><span data-token="string">$</span><span data-token="fieldAndAttribute">_name</span><span data-token="string">'</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
    <span data-token="punctuation">}</span> <span data-token="keyword">catch</span> <span data-token="punctuation">(</span><span data-token="variable">e</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
      <span data-token="keyword">return</span> <span data-token="class">Failure</span><span data-token="punctuation">(</span><span data-token="class">Exception</span><span data-token="punctuation">(</span><span data-token="string">'</span><span data-token="string">$</span><span data-token="variable">e</span><span data-token="string">'</span><span data-token="punctuation">)</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
    <span data-token="punctuation">}</span>
  <span data-token="punctuation">}</span>

  <span data-token="comment">// Pattern matching with switch expression (Dart 3)</span>
  <span data-token="class">String</span> <span data-token="functionAndMethod">describe</span><span data-token="punctuation">(</span><span data-token="class">Result</span><span data-token="punctuation">&lt;</span><span data-token="class">String</span><span data-token="punctuation">&gt;</span> <span data-token="parameter">result</span><span data-token="punctuation">)</span> <span data-token="operator">=></span> <span data-token="keyword">switch</span> <span data-token="punctuation">(</span><span data-token="parameter">result</span><span data-token="punctuation">)</span> <span data-token="punctuation">{</span>
    <span data-token="class">Success</span><span data-token="punctuation">(</span><span data-token="fieldAndAttribute">value</span><span data-token="operator">:</span> <span data-token="keyword">final</span> <span data-token="variable">v</span><span data-token="punctuation">)</span> <span data-token="operator">=></span> <span data-token="string">'Success: </span><span data-token="string">$</span><span data-token="variable">v</span><span data-token="string">'</span><span data-token="punctuation">,</span>
    <span data-token="class">Failure</span><span data-token="punctuation">(</span><span data-token="fieldAndAttribute">error</span><span data-token="operator">:</span> <span data-token="keyword">final</span> <span data-token="variable">e</span><span data-token="punctuation">)</span> <span data-token="operator">=></span> <span data-token="string">'Failed: </span><span data-token="string">$</span><span data-token="variable">e</span><span data-token="string">'</span><span data-token="punctuation">,</span>
  <span data-token="punctuation">}</span><span data-token="punctuation">;</span>

  <span data-token="annotation">@override</span>
  <span data-token="class">String</span> <span data-token="functionAndMethod">toString</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span> <span data-token="operator">=></span> <span data-token="string">'DataService(</span><span data-token="string">$</span><span data-token="fieldAndAttribute">_name</span><span data-token="string">)'</span><span data-token="punctuation">;</span>
<span data-token="punctuation">}</span>

<span data-token="type">void</span> <span data-token="functionAndMethod">main</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span> <span data-token="keyword">async</span> <span data-token="punctuation">{</span>
  <span data-token="keyword">final</span> <span data-token="variable">service</span> <span data-token="operator">=</span> <span data-token="class">DataService</span><span data-token="operator">.</span><span data-token="functionAndMethod">create</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
  <span data-token="keyword">final</span> <span data-token="variable">result</span> <span data-token="operator">=</span> <span data-token="keyword">await</span> <span data-token="variable">service</span><span data-token="operator">.</span><span data-token="functionAndMethod">fetch</span><span data-token="punctuation">(</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>

  <span data-token="comment">// Null-aware access and assertion</span>
  <span data-token="keyword">final</span> <span data-token="class">String</span><span data-token="operator">?</span> <span data-token="variable">name</span> <span data-token="operator">=</span> <span data-token="variable">service</span><span data-token="operator">.</span><span data-token="fieldAndAttribute">name</span><span data-token="punctuation">;</span>
  <span data-token="keyword">final</span> <span data-token="variable">length</span> <span data-token="operator">=</span> <span data-token="variable">name</span><span data-token="operator">?.</span><span data-token="fieldAndAttribute">length</span> <span data-token="operator">??</span> <span data-token="number">0</span><span data-token="punctuation">;</span>

  <span data-token="comment">// Using extension method</span>
  <span data-token="functionAndMethod">print</span><span data-token="punctuation">(</span><span data-token="string">'hello'</span><span data-token="operator">.</span><span data-token="fieldAndAttribute">capitalized</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>

  <span data-token="comment">// Multi-line string</span>
  <span data-token="keyword">final</span> <span data-token="variable">message</span> <span data-token="operator">=</span> <span data-token="string">'''
    Name: </span><span data-token="string">$</span><span data-token="variable">name</span><span data-token="string">
    Length: </span><span data-token="string">$</span><span data-token="variable">length</span><span data-token="string">
  '''</span><span data-token="punctuation">;</span>

  <span data-token="comment">// Raw string</span>
  <span data-token="keyword">final</span> <span data-token="variable">path</span> <span data-token="operator">=</span> <span data-token="string">r'C:\\Users\\name'</span><span data-token="punctuation">;</span>

  <span data-token="variable">service</span><span data-token="operator">.</span><span data-token="functionAndMethod">log</span><span data-token="punctuation">(</span><span data-token="variable">message</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
  <span data-token="functionAndMethod">print</span><span data-token="punctuation">(</span><span data-token="variable">service</span><span data-token="operator">.</span><span data-token="functionAndMethod">describe</span><span data-token="punctuation">(</span><span data-token="variable">result</span><span data-token="punctuation">)</span><span data-token="punctuation">)</span><span data-token="punctuation">;</span>
<span data-token="punctuation">}</span>
`;
