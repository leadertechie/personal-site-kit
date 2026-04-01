// Minimal prerender AST->HTML utility
export function renderFromAst(ast: any): string {
  if (!ast) return '';
  if (ast.type === 'document' && Array.isArray(ast.children)) {
    return ast.children.map(renderFromAst).join('\n');
  }
  if (ast.type === 'heading') {
    const level = Math.max(1, Math.min(6, ast.depth || 1));
    const inner = Array.isArray(ast.children) ? ast.children.map(renderFromAst).join('') : '';
    return `<h${level}>${inner}</h${level}>`;
  }
  if (ast.type === 'paragraph') {
    const inner = Array.isArray(ast.children) ? ast.children.map(renderFromAst).join('') : '';
    return `<p>${inner}</p>`;
  }
  if (ast.type === 'text') {
    return ast.value || '';
  }
  if (ast.children) {
    return ast.children.map(renderFromAst).join('');
  }
  return '';
}

export default renderFromAst
