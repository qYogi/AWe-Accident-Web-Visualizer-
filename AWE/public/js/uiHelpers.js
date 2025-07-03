var o=new Set,a=new Set;function d(){let t=document.getElementById("states-list"),n=document.getElementById("selected-states");o.size>0?(t.innerHTML="",o.forEach(e=>{let r=document.querySelector(`#state option[value="${e}"]`),s=r?r.textContent:e,i=document.createElement("div");i.style.cssText="background: #4e79a7; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; display: flex; align-items: center; gap: 0.5rem;",i.innerHTML=`
        <span>\u2713 ${s}</span>
        <button type="button" onclick="removeState('${e}')" style="background: none; border: none; color: white; cursor: pointer; font-weight: bold;">\xD7</button>
      `,t.appendChild(i)}),n.style.display="block"):n.style.display="none"}function u(){let t=document.getElementById("cities-list");t.innerHTML="",a.forEach(n=>{let e=document.createElement("div");e.style.cssText="background: #f28e2b; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; display: flex; align-items: center; gap: 0.5rem;",e.innerHTML=`
      <span>${n}</span>
      <button type="button" onclick="removeCity('${n}')" style="background: none; border: none; color: white; cursor: pointer; font-weight: bold;">\xD7</button>
    `,t.appendChild(e)})}export{u as updateSelectedCitiesDisplay,d as updateSelectedStatesDisplay};
