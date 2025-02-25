!function(){"use strict";console.log("Writing Assistant: Background script loaded"),chrome.runtime.onInstalled.addListener((()=>{chrome.storage.sync.set({isEnabled:!0,selectedModel:"gpt-4"})})),chrome.runtime.onMessage.addListener(((e,t,s)=>{if("generateText"===e.action)return chrome.storage.sync.get(["apiKey","selectedModel"],(async t=>{const{apiKey:n,selectedModel:r}=t;if(n)try{const t=await async function(e,t,s,n,r){let a="You are a helpful writing assistant.";switch(r){case"phrase":a+=" Provide a brief phrase as response (3-7 words).";break;case"sentence":a+=" Provide a single complete sentence as response.";break;case"paragraph":a+=" Provide a full paragraph as response."}const o=`Context: ${n}\n\nInstruction: ${s}`,i=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${e}`},body:JSON.stringify({model:t,messages:[{role:"system",content:a},{role:"user",content:o}],temperature:.7,max_tokens:"paragraph"===r?250:"sentence"===r?60:20})}),c=await i.json();if(!i.ok)throw new Error(c.error?.message||"Failed to generate text");return c.choices[0].message.content.trim()}(n,r,e.prompt,e.context,e.outputLength);s({text:t})}catch(e){s({error:e.message||"Failed to generate text"})}else s({error:"API key not set. Please set your API key in the extension settings."})})),!0}))}();
