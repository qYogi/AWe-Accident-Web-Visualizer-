var i=new Set,c=new Set;function r(){let t=document.getElementById("states-list"),n=document.getElementById("selected-states");i.size>0?(t.innerHTML="",i.forEach(e=>{let s=document.querySelector(`#state option[value="${e}"]`),l=s?s.textContent:e,o=document.createElement("div");o.style.cssText="background: #4e79a7; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; display: flex; align-items: center; gap: 0.5rem;",o.innerHTML=`
        <span>\u2713 ${l}</span>
        <button type="button" onclick="removeState('${e}')" style="background: none; border: none; color: white; cursor: pointer; font-weight: bold;">\xD7</button>
      `,t.appendChild(o)}),n.style.display="block"):n.style.display="none"}function p(){let t=document.getElementById("cities-list");t.innerHTML="",c.forEach(n=>{let e=document.createElement("div");e.style.cssText="background: #f28e2b; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; display: flex; align-items: center; gap: 0.5rem;",e.innerHTML=`
      <span>${n}</span>
      <button type="button" onclick="removeCity('${n}')" style="background: none; border: none; color: white; cursor: pointer; font-weight: bold;">\xD7</button>
    `,t.appendChild(e)})}export{p as updateSelectedCitiesDisplay,r as updateSelectedStatesDisplay};
