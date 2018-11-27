// ==UserScript==
// @name freeCodeCamp curriculum progressbar
// @namespace T1mL3arn
// @description Adds progressbar to each section's topic of curriculum
// @match https://learn.freecodecamp.org/*
// @noframes
// @version 1.2
// @license GPLv3
// ==/UserScript==

(() => {
    const log = console.log;
    log('freeCodeCamp curriculum progressbar inited');

    window.setTimeout(()=>{

        const css = `
    
    .fcc-progressbar { 
        width: 100%;
        height: 10px;
        z-index: 1;
        position: absolute;
        bottom: 0;
    }

    .fcc-progressbar__bg {
        background-color: gray;
        background-color: hsl(120, 50%, 75%);
        width: 100%;
        height: inherit;
    }

    .fcc-progressbar__progress {
        background-color: rgb(0, 128, 0);
        width: 0;
        height: inherit;
        position: absolute;
        top: 0; left: 0;
    }

    `;

        const id = 'fcc-progressbar-css';
        const styleElt = document.getElementById(id) || document.head.appendChild(document.createElement('style'));
        styleElt.id = id;
        styleElt.textContent = css;
    }, 1000);
    
    const childObserver = new MutationObserver(onChildlistMutation);
    const childObsArgs = {subtree: true, childList: true};
    childObserver.observe(document.body, childObsArgs);

    const attributesObserver = new MutationObserver(onAttributesMutation);
    const attrObsArgs = {attributes: true, subtree: true, attributeFilter: ["class"]};
    attributesObserver.observe(document.body, attrObsArgs);

    function onAttributesMutation(changes, obs) {
        obs.disconnect();

        let classMutations = changes.filter(ch => ch.target != null && ch.target.matches('.map-challenge-title-completed'));
        
        if(classMutations.length > 0){
            const openTopics = classMutations.reduce((topics, change) => {
                const topic = change.target.parentElement.parentElement;
                if(!topics.includes(topic)) topics.push(topic);
                return topics;
            }, []);
            openTopics.forEach(t => addProgressBar(t)); 
        }

        obs.observe(document.body, attrObsArgs);
    }

    function onChildlistMutation(changes, obs) {
        obs.disconnect();
        changes.forEach(change => { if(change.addedNodes.length > 0)  processAllTopics(); });
        obs.observe(document.body, childObsArgs);
    }

    function processAllTopics() {

        const openTopics = Array.from(document.querySelectorAll('.block.open')).filter(t => !t.querySelector('.fcc-progressbar'));
        const titleElements = Array.from(openTopics, (elt => elt.querySelector('.map-title')));

        // log('open elements', openTopics, 'header elements', titleElements);

        for(let i=0; i<openTopics.length; i++) {
            addProgressBar(openTopics[i]);
        }
    }

    function addProgressBar(openTopicElt) {
        const ulElt = openTopicElt.querySelector('ul');

        if(!ulElt){
            console.error('There is no <UL> for', openTopicElt);
            return;
        }

        const listItems = Array.from(ulElt.children);
        const completed = listItems.filter(item => item.matches('.map-challenge-title-completed'));
        let progress = completed.length / (listItems.length-1);
        progress = Math.round(progress * 100);

        // console.log(`progress is ${progress}`, completed.length, listItems.length-1);
        
        const bar = openTopicElt.querySelector('.fcc-progressbar') || createProgressbarElt();
        setProgress(bar, progress);

        const titleElt = openTopicElt.children[0];
        titleElt.appendChild(bar);
        titleElt.style.position = 'relative';

        // override H5 bottom margin
        titleElt.children[1].style.marginBottom = 0;
    }

    function createProgressbarElt() {
        const bar = document.createElement('div');
        bar.classList.add('fcc-progressbar');
        
        const barBg = bar.appendChild(document.createElement('div'));
        barBg.classList.add('fcc-progressbar__bg');

        const barProgress = bar.appendChild(document.createElement('div'));
        barProgress.classList.add('fcc-progressbar__progress');
        // barProgress.style.width = `${progress}%`;

        return bar;
    }

    function setProgress(bar, progress){
        bar.querySelector('.fcc-progressbar__progress').style.width = `${progress}%`;
    }
})();