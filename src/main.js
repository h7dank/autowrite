import Markdown from 'markdown'
import style0 from '!!raw-loader!./doc/style0.css'
import style1 from '!!raw-loader!./doc/style1.css'
import style2 from '!!raw-loader!./doc/style2.css'
import style3 from '!!raw-loader!./doc/style3.css'
import {default as writeChar, writeSimpleChar, handleChar} from './js/writechar'
import resumeHtml from '!!raw-loader!./doc/resume.html'
import resumeCss from '!!raw-loader!./doc/resume.css'
import './style/main.css'
import Promise from 'bluebird'
const md = Markdown.markdown.toHTML


let el, styleEl, resumeEl, resumeStyleEl, skipEl
let paused = false, skipAnimation = false, done = false
let styleBuffer = ''
let endOfSentence = /[\.\?\!]\s$/;
let comma = /\D[\,]\s$/;
let endOfBlock = /[^\/]\n\n$/;
console.log('resumeHtml', resumeHtml)
async function writeTo(el, message, index, interval, charPerInterval) {
    if (skipAnimation) {
        throw new Error('Skip')
    }
    let chars = message.slice(index, index + charPerInterval)
    index += charPerInterval
    writeChar(el, chars, styleEl)
    // el.innerHTML += chars
    // styleBuffer += chars
    // if (chars === ';') {

    //     styleEl.textContent += styleBuffer
    //     styleBuffer = ''
    // }
    el.scrollTop = el.scrollHeight

    if (index < message.length) {
        let thisInterval = interval
        let thisSlice = message.slice(index - 2, index + 1)

        if (comma.test(thisSlice)) thisInterval = interval * 30;
        if (endOfBlock.test(thisSlice)) thisInterval = interval * 50;
        if (endOfSentence.test(thisSlice)) thisInterval = interval * 70;

        do {
        await Promise.delay(thisInterval);
        } while(paused);
        
        return writeTo(el, message, index, interval, charPerInterval)
    }
}

async function createResume() {
    resumeEl.innerHTML = resumeHtml
}

function stopAnimation () {
    if (done) {
        return
    }
    done = true
    let styleText = ''
    styleText = styleText.concat(style0, style1, style2, style3)
    styleEl.textContent = styleText
    let tempText = ''
    for (let i = 0; i < styleText.length; i++) {
        tempText = handleChar(tempText, styleText[i])
    }
    el.innerHTML = tempText
    let tempResumeText = ''
    for (let i = 0; i < resumeCss.length; i++) {
        tempResumeText = handleChar(tempResumeText, resumeCss[i])
    }
    styleEl.textContent += resumeCss
    resumeStyleEl.innerHTML = tempResumeText
    createResume()
}

async function startAnimation () {

    try {
        await writeTo(el, style0, 0, 10, 1)
        await writeTo(el, style1, 0, 10, 1)
        await writeTo(el, style2, 0, 10, 1)
        await writeTo(el, style3, 0, 10, 1)
        await createResume()
        await writeTo(resumeStyleEl, resumeCss, 0, 1, 1)
    } catch (e) {
        if (e.message === 'Skip') {
            stopAnimation()
        }
    }
}

function createEventHandle () {
    el.addEventListener('input', e => {
        styleEl.textContent = el.textContent;
        styleEl.textContent += resumeCss
    })
    skipEl.addEventListener('click', e => {
        e.preventDefault()
        skipAnimation = true
    })
}

window.onload = function () {
    el = document.getElementById('left')
    styleEl = document.getElementById('style-tag')
    resumeEl = document.getElementById('resume')
    resumeStyleEl = document.getElementById('left-bottom')
    skipEl = document.getElementById('skip')
    createEventHandle()
    startAnimation()
}
