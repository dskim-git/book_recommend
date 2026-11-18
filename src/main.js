import './style.css'

const app = document.querySelector('#app')
const state = {
  authorId: '',
  authorName: '',
  bookTitle: '',
  bookAuthor: '',
  bookGenre: '',
  bookLink: '',
  recommendationReason: '',
  recommendedFor: [],
  readingDifficulty: '',
  recommendationScore: '',
  oneLineIntroduction: '',
}

const googleFormEndpoint = 'https://docs.google.com/forms/d/e/1FAIpQLSforlIpG1Oay2SgUYhIf0Sxb6tKrQ1FozQmeSp9VozmsXvGMQ/formResponse'
const googleFormEntries = {
  authorId: 'entry.221480460',
  authorName: 'entry.2076011084',
  bookTitle: 'entry.375906615',
  bookAuthor: 'entry.670653256',
  bookGenre: 'entry.1164138244',
  bookLink: 'entry.190790343',
  recommendationReason: 'entry.694237515',
  recommendedFor: 'entry.1322456071',
  readingDifficulty: 'entry.993332885',
  recommendationScore: 'entry.923728455',
  oneLineIntroduction: 'entry.1806260192',
}

const genres = ['소설', '에세이', '과학', '역사', '만화', '자기계발', '기타']
const audiences = [
  '재미있는 이야기를 좋아하는 친구',
  '과학에 관심 있는 친구',
  '짧은 책을 찾는 친구',
  '감동적인 이야기를 읽고 싶은 친구',
  '새로운 지식을 얻고 싶은 친구',
  '기타',
]
const difficulties = ['쉬움', '보통', '어려움']
let step = 1
let errors = {}
let isSubmitting = false
let submissionError = ''

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char])

function field({ name, label, value = '', type = 'text', required = false, hint = '', placeholder = '' }) {
  const error = errors[name]
  const requiredMark = required ? '<span class="required">필수</span>' : '<span class="optional">선택</span>'
  const control = type === 'textarea'
    ? `<textarea id="${name}" name="${name}" rows="5" ${required ? 'required' : ''} placeholder="${placeholder}">${escapeHtml(value)}</textarea>`
    : `<input id="${name}" name="${name}" type="${type}" value="${escapeHtml(value)}" ${required ? 'required' : ''} placeholder="${placeholder}" ${type === 'url' ? 'inputmode="url"' : ''}>`
  return `<div class="field ${error ? 'has-error' : ''}"><div class="label-row"><label for="${name}">${label}</label>${requiredMark}</div>${control}${hint ? `<p class="hint">${hint}</p>` : ''}<p class="error" id="${name}-error" aria-live="polite">${error ?? ''}</p></div>`
}

function radios(name, label, options, value, required = false) {
  return `<fieldset class="field choice-field ${errors[name] ? 'has-error' : ''}"><legend>${label} ${required ? '<span class="required">필수</span>' : ''}</legend><div class="choice-grid">${options.map((option, index) => `<label class="choice" for="${name}-${index}"><input id="${name}-${index}" name="${name}" type="radio" value="${escapeHtml(option)}" ${value === option ? 'checked' : ''}><span>${escapeHtml(option)}</span></label>`).join('')}</div><p class="error" aria-live="polite">${errors[name] ?? ''}</p></fieldset>`
}

function checkboxes(name, label, options, values) {
  return `<fieldset class="field choice-field"><legend>${label} <span class="optional">선택</span></legend><div class="choice-grid">${options.map((option, index) => `<label class="choice" for="${name}-${index}"><input id="${name}-${index}" name="${name}" type="checkbox" value="${escapeHtml(option)}" ${values.includes(option) ? 'checked' : ''}><span>${escapeHtml(option)}</span></label>`).join('')}</div><p class="hint">여러 항목을 선택할 수 있어요.</p></fieldset>`
}

function reviewRow(label, value) {
  const display = Array.isArray(value) ? value.join(', ') : value
  return `<div class="review-row"><dt>${label}</dt><dd>${display ? escapeHtml(display) : '<span class="empty-value">입력하지 않음</span>'}</dd></div>`
}

function review() {
  return `<section class="review-group"><h3>작성자 정보</h3><dl>${reviewRow('학번', state.authorId)}${reviewRow('이름', state.authorName)}</dl></section>
    <section class="review-group"><h3>책 정보</h3><dl>${reviewRow('책 제목', state.bookTitle)}${reviewRow('저자', state.bookAuthor)}${reviewRow('분야', state.bookGenre)}${reviewRow('표지 이미지 또는 책 소개 링크', state.bookLink)}</dl></section>
    <section class="review-group"><h3>추천 정보</h3><dl>${reviewRow('추천 이유', state.recommendationReason)}${reviewRow('추천 대상', state.recommendedFor)}${reviewRow('읽기 난이도', state.readingDifficulty)}${reviewRow('추천 점수', state.recommendationScore ? `${state.recommendationScore}점` : '')}${reviewRow('한 줄 소개', state.oneLineIntroduction)}</dl></section>`
}

function render() {
  if (step === 5) {
    app.innerHTML = `<main class="page-shell"><header class="site-header"><a class="brand" href="./" aria-label="나의 책을 소개합니다 홈"><span class="brand-mark" aria-hidden="true">冊</span><span>나의 책을 소개합니다</span></a></header><section class="completion card" aria-live="polite"><span class="completion-icon" aria-hidden="true">✓</span><p class="eyebrow">등록 완료</p><h1>추천 전송 요청을 보냈어요!</h1><p class="intro">친구의 책장이 한 권 더 풍성해졌어요.<br>소중한 추천을 남겨 주셔서 고맙습니다.</p><button class="button button-primary" type="button" data-action="reset">새 추천 작성하기</button></section><footer>한 권의 책이 새로운 이야기를 시작합니다.</footer></main>`
    return
  }

  const page = {
    1: { title: '작성자 정보', intro: '누가 이 책을 추천하는지 알려 주세요.', content: `${field({ name: 'authorId', label: '학번', value: state.authorId, required: true, placeholder: '예: 20301' })}${field({ name: 'authorName', label: '이름', value: state.authorName, required: true, placeholder: '이름을 입력해 주세요' })}`, next: '다음' },
    2: { title: '책 정보', intro: '친구에게 소개할 책을 알려 주세요.', content: `${field({ name: 'bookTitle', label: '책 제목', value: state.bookTitle, required: true, placeholder: '책 제목을 입력해 주세요' })}${field({ name: 'bookAuthor', label: '저자', value: state.bookAuthor, required: true, placeholder: '저자 이름을 입력해 주세요' })}${radios('bookGenre', '분야', genres, state.bookGenre, true)}${field({ name: 'bookLink', label: '표지 이미지 또는 책 소개 링크', value: state.bookLink, type: 'url', hint: '책을 더 잘 소개할 수 있는 웹 주소가 있다면 입력해 주세요.', placeholder: 'https://...' })}`, next: '다음' },
    3: { title: '추천 정보', intro: '이 책의 매력을 친구들에게 들려주세요.', content: `${field({ name: 'recommendationReason', label: '추천 이유', value: state.recommendationReason, type: 'textarea', required: true, placeholder: '어떤 점이 좋았는지 편하게 적어 주세요.' })}${checkboxes('recommendedFor', '추천 대상', audiences, state.recommendedFor)}${radios('readingDifficulty', '읽기 난이도', difficulties, state.readingDifficulty, true)}${radios('recommendationScore', '추천 점수', ['1', '2', '3', '4', '5'], state.recommendationScore, true)}${field({ name: 'oneLineIntroduction', label: '한 줄 소개', value: state.oneLineIntroduction, hint: '친구의 호기심을 깨울 한 문장!', placeholder: '예: 마지막 장까지 손에서 놓을 수 없는 이야기' })}`, next: '입력 내용 확인' },
    4: { title: '입력 내용 확인', intro: '내용을 확인해 주세요. 이전 단계에서 언제든 수정할 수 있어요.', content: `<div class="review-card">${review()}</div>${submissionError ? `<p class="submission-error" role="alert">${submissionError}</p>` : ''}`, next: isSubmitting ? '전송 중...' : '등록 완료' },
  }[step]

  app.innerHTML = `<main class="page-shell"><header class="site-header"><a class="brand" href="./" aria-label="나의 책을 소개합니다 홈"><span class="brand-mark" aria-hidden="true">冊</span><span>나의 책을 소개합니다</span></a><span class="header-note">우리 반 책 추천</span></header><section class="wizard"><div class="progress-head"><span class="eyebrow">책 추천 작성</span><span class="step-count">${step} <span>/</span> 4 단계</span></div><div class="progress-track" role="progressbar" aria-label="입력 진행률" aria-valuemin="1" aria-valuemax="4" aria-valuenow="${step}"><span style="width:${step * 25}%"></span></div><article class="card" key="step-${step}"><div class="card-heading"><span class="step-kicker">STEP 0${step}</span><h1>${page.title}</h1><p class="intro">${page.intro}</p></div><form id="step-form" novalidate><div class="form-content">${page.content}</div><div class="form-actions">${step > 1 ? `<button class="button button-secondary" type="button" data-action="back" ${isSubmitting ? 'disabled' : ''}>이전</button>` : '<span></span>'}<button class="button button-primary" type="submit" ${isSubmitting ? 'disabled' : ''}>${page.next}<span aria-hidden="true">${step === 4 ? ' ✓' : ' →'}</span></button></div></form></article><p class="privacy-note"><span aria-hidden="true">▤</span> 등록 완료를 누르면 추천 내용이 Google Form으로 전송됩니다.</p></section><footer>한 권의 책이 새로운 이야기를 시작합니다.</footer></main>`
  bindForm()
}

function bindForm() {
  const form = document.querySelector('#step-form')
  form.addEventListener('input', (event) => {
    const { name, value } = event.target
    if (name && name in state && !['recommendedFor'].includes(name)) state[name] = value
    if (name && errors[name] && value.trim()) {
      delete errors[name]
      event.target.closest('.field')?.classList.remove('has-error')
      const error = document.querySelector(`#${name}-error`)
      if (error) error.textContent = ''
    }
  })
  form.addEventListener('change', (event) => {
    const { name, value, type, checked } = event.target
    if (name === 'recommendedFor') {
      state.recommendedFor = checked ? [...state.recommendedFor, value] : state.recommendedFor.filter((item) => item !== value)
    } else if (type === 'radio' && name in state) {
      state[name] = value
      delete errors[name]
      event.target.closest('.field')?.classList.remove('has-error')
    }
  })
  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    if (isSubmitting) return
    errors = validateStep()
    if (Object.keys(errors).length) {
      render()
      document.querySelector('.has-error input, .has-error textarea')?.focus()
      return
    }
    if (step === 4) {
      isSubmitting = true
      submissionError = ''
      render()
      try {
        await submitToGoogleForm()
        step = 5
      } catch {
        submissionError = '전송 중 문제가 생겼어요. 인터넷 연결을 확인한 뒤 다시 시도해 주세요.'
      } finally {
        isSubmitting = false
      }
    } else {
      step += 1
    }
    render()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
  document.querySelector('[data-action="back"]')?.addEventListener('click', () => {
    step -= 1
    errors = {}
    render()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  })
}

async function submitToGoogleForm() {
  const payload = new URLSearchParams()
  for (const [fieldName, entryName] of Object.entries(googleFormEntries)) {
    const value = fieldName === 'recommendedFor'
      ? state[fieldName].join(',')
      : state[fieldName]
    payload.set(entryName, value)
  }

  await fetch(googleFormEndpoint, {
    method: 'POST',
    mode: 'no-cors',
    body: payload,
  })
}

function validateStep() {
  const requiredByStep = {
    1: [['authorId', '학번을 입력해 주세요.'], ['authorName', '이름을 입력해 주세요.']],
    2: [['bookTitle', '책 제목을 입력해 주세요.'], ['bookAuthor', '저자를 입력해 주세요.'], ['bookGenre', '분야를 선택해 주세요.']],
    3: [['recommendationReason', '추천 이유를 입력해 주세요.'], ['readingDifficulty', '읽기 난이도를 선택해 주세요.'], ['recommendationScore', '추천 점수를 선택해 주세요.']],
  }
  const found = {}
  for (const [key, message] of requiredByStep[step] ?? []) {
    if (!String(state[key] ?? '').trim()) found[key] = message
  }
  if (step === 2 && state.bookLink && !/^https?:\/\//i.test(state.bookLink)) found.bookLink = 'http 또는 https로 시작하는 주소를 입력해 주세요.'
  return found
}

app.addEventListener('click', (event) => {
  if (event.target.closest('[data-action="reset"]')) {
    for (const key of Object.keys(state)) state[key] = Array.isArray(state[key]) ? [] : ''
    step = 1
    errors = {}
    render()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
})

render()
