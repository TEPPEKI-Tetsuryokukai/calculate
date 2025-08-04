// 最大公約数（ユークリッドの互除法）
function gcd(a, b) {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

// 分数クラス
class Fraction {
  constructor(n, d = 1) {
    if (d === 0) throw new Error("分母は0不可");
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d);
    this.n = n / g;
    this.d = d / g;
  }

  add(f) {
    return new Fraction(this.n * f.d + f.n * this.d, this.d * f.d);
  }
  sub(f) {
    return new Fraction(this.n * f.d - f.n * this.d, this.d * f.d);
  }
  mul(f) {
    return new Fraction(this.n * f.n, this.d * f.d);
  }
  div(f) {
    if (f.n === 0) throw new Error("0で割り算");
    return new Fraction(this.n * f.d, this.d * f.n);
  }

  toString() {
    if (this.d === 1) return `${this.n}`;
    return `\\frac{${this.n}}{${this.d}}`;
  }
}

// ランダム整数取得（元のまま）
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 既存のgetRandomValue関数（変更なし）
function getRandomValue(settings) {
  const {
    numerMin, numerMax,
    denomMin, denomMax,
    allowInt, allowFrac
  } = settings;

  const choices = [];

  if (allowInt) {
    for (let i = numerMin; i <= numerMax; i++) {
      choices.push(`${i}`);
    }
  }

  if (allowFrac) {
    for (let n = numerMin; n <= numerMax; n++) {
      for (let d = denomMin; d <= denomMax; d++) {
        if (d !== 0 && gcd(n, d) === 1 && Math.abs(d) > 1) {
          choices.push(`\\frac{${n}}{${d}}`);
        }
      }
    }
  }

  if (choices.length === 0) return '0';
  return choices[Math.floor(Math.random() * choices.length)];
}

// LaTeX分数をFractionに変換
function parseLatexFractionFrac(latex) {
  if (latex.includes('\\frac')) {
    const match = latex.match(/\\frac{(-?\d+)}{(-?\d+)}/);
    return new Fraction(parseInt(match[1]), parseInt(match[2]));
  }
  return new Fraction(parseInt(latex));
}

// 多項式生成（係数配列とlatex文字列を返す）
function generatePolynomial(degree) {
  const latexTerms = [];
  const coeffs = [];
  for (let i = degree; i >= 0; i--) {
    let coeff = getRandomInt(-9, 9);
    if (i === degree && coeff === 0) coeff = getRandomInt(1, 9);
    if (i !== 0 && coeff === 0) {
      coeffs[i] = 0;
      continue;
    }
    coeffs[i] = coeff;

    let term = '';
    if (coeff === -1 && i !== 0) term += '-';
    else if (coeff !== 1 || i === 0) term += coeff;
    if (i >= 1) term += 'x';
    if (i >= 2) term += `^{${i}}`;
    latexTerms.push(term);
  }
  const latex = latexTerms.join(' + ').replace(/\+\s*-/g, '- ');
  return { coeffs, latex };
}

// 分数で多項式を評価
function evaluatePolynomialFraction(coeffs, xFrac) {
  let result = new Fraction(0, 1);
  for (let i = 0; i < coeffs.length; i++) {
    const c = coeffs[i] || 0;
    let term = new Fraction(1, 1);
    for (let j = 0; j < i; j++) {
      term = term.mul(xFrac);
    }
    term = term.mul(new Fraction(c));
    result = result.add(term);
  }
  return result;
}

// 問題生成＆表示（例：HTMLのIDが'problems'と'answers'のdivがある想定）
function generateProblems() {
  const count = parseInt(document.getElementById('count').value);
  const minDeg = parseInt(document.getElementById('minDegree').value);
  const maxDeg = parseInt(document.getElementById('maxDegree').value);
  const numerMin = parseInt(document.getElementById('numerMin').value);
  const numerMax = parseInt(document.getElementById('numerMax').value);
  const denomMin = parseInt(document.getElementById('denomMin').value);
  const denomMax = parseInt(document.getElementById('denomMax').value);
  const allowInt = document.getElementById('allowInt').checked;
  const allowFrac = document.getElementById('allowFrac').checked;

  const problems = document.getElementById('problems');
  const answers = document.getElementById('answers');
  problems.innerHTML = '';
  answers.innerHTML = '';

  const valueSettings = { numerMin, numerMax, denomMin, denomMax, allowInt, allowFrac };

  for (let i = 0; i < count; i++) {
    const degree = getRandomInt(minDeg, maxDeg);
    const { coeffs, latex } = generatePolynomial(degree);
    const xLatex = getRandomValue(valueSettings);
    const xVal = parseLatexFractionFrac(xLatex);
    const yVal = evaluatePolynomialFraction(coeffs, xVal);

    const pLatex = `f(x) = ${latex},\\quad x = ${xLatex}`;
    const aLatex = `f(${xLatex}) = ${yVal.toString()}`;

    problems.innerHTML += `<div class="problem latex">\\(${pLatex}\\)</div>`;
    answers.innerHTML += `<div class="answer latex">\\(${aLatex}\\)</div>`;
  }

  MathJax.typeset();
}
