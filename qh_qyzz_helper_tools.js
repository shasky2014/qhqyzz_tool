async function loadJSONData(jsonfile) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.overrideMimeType('application/json');
        xhr.open('GET', jsonfile, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 || xhr.status === 0) { // 0表示本地文件
                    try {
                        var tmp=xhr.responseText;
                        const jsonData = JSON.parse(tmp);
                        resolve(jsonData);
                    } catch (e) {
                        console.error(`JSON parse ${jsonfile} error:`, e);
                        reject(e);
                    }
                } else {
                    console.error(`file ${jsonfile}  load error:`, xhr.status);
                    reject(new Error(`Failed to load ${jsonfile}: ${xhr.status}`));
                }
            }
        };
        xhr.send(null);
    });
}

function toggleSeals(name) {
    const sealsDiv = document.getElementById(`${name}-container`);
    const header = document.getElementById(`${name}-toggle-header`);
    
    if (sealsDiv.style.display === 'none') {
        sealsDiv.style.display = 'block';
        header.classList.remove('collapsed');
    } else {
        sealsDiv.style.display = 'none';
        header.classList.add('collapsed');
    }
}
    
function showSealInfo(img,event) { 
    console.log(img.sealname,img.description);
    
    let popup = document.getElementById('seal-info-popup');
    if (popup) {
        popup.remove();
    }
    popup = document.createElement('div');
    popup.id = 'seal-info-popup';
    let infoContent ="";
    infoContent += `<img src="${img.src}" alt="${img.alt}" style="max-width: 100%; height: auto; display: block; margin: 0 auto 10px;">`;
    infoContent += `<h2>${img.sealname}</h2>`;

    infoContent += `<h3><strong>${img.description}</strong>  </h3>`;

    if (img.note) {
        let noteContent = "";
        noteContent += '<div class="notes-section">';
        noteContent +='<div class="note-marker">note</div>'; // 添加note标记
        for(let i=0;i<img.note.length;i++){
            noteContent += `<p><strong>${(i+1)}:</strong> ${img.note.at(i)}</p>`;
        }
        noteContent += '</div>';
        infoContent += noteContent;
    }

    popup.innerHTML = infoContent;
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 999;
    `;
    const x = event.clientX;
    const y = event.clientY;

    const popupWidth = popup.offsetWidth || 340; // 默认宽度
    const popupHeight = popup.offsetHeight || 200; // 默认高度
    let leftPos = x + 20; // 在点击位置右侧20px
    let topPos = y;  // 在点击位置上方10px
    if (leftPos + popupWidth > window.innerWidth) {
        leftPos = x - popupWidth - 10; // 如果超出右边，则显示在左侧
    }
    
    // 检查是否超出底部边界
    if (topPos + popupHeight > window.innerHeight) {
        topPos = window.innerHeight - popupHeight - 10; // 如果超出底部，则调整到可见区域
    }
    
    // 确保不超出顶部
    if (topPos < 0) {
        topPos = 10;
    }
    
    // 确保不超出左边
    if (leftPos < 0) {
        leftPos = 10;
    }
    
    popup.style.left = `${leftPos}px`;
    popup.style.top = `${topPos}px`;
    
    overlay.onclick = function() {
        popup.remove();
        overlay.remove();
    };
    
    document.body.appendChild(overlay);
    document.body.appendChild(popup);
}

function create_seals(eid,conf,seal_info) { 

    const bfubg_Body = document.getElementById(eid);
    const row = document.createElement('tr');
    for (let j = 0; j < conf.imagesPerRow; j++) {
        const cell = document.createElement('td');
        const imgContainer = document.createElement('div');
        var PN = (j+1)
        imgContainer.className = conf.classname;
        const img = document.createElement('img');
        img.src = `${conf.imagePathPrefix}${PN}${conf.imageExtension}`;
        img.alt = `seal_${conf.seal_level}_0${PN}`;
        img.sealname = seal_info[PN]["name"]
        img.description = seal_info[PN]['description']
        if (seal_info[PN]['note']){
            img.note = seal_info[PN]['note']
        }

        img.dataset.sealId = `seal_${conf.seal_level}_0${PN}`; 

        img.addEventListener('click', function(event) {
            showSealInfo(event.target,event);
        });

        // 添加错误处理，当图片不存在时显示提示
        img.onerror = function() {
            this.style.display = 'none';
            const errorText = document.createElement('span');
            errorText.textContent = `图片未找到: ${this.src}`;
            errorText.style.color = 'red';
            errorText.style.fontSize = '12px';
            imgContainer.appendChild(errorText);
        };
        
        imgContainer.appendChild(img);
        cell.appendChild(imgContainer);
        
        row.appendChild(cell);
    }
    bfubg_Body.appendChild(row);
}


function loadFuImages(fuData,fu_conf) {
    const levels = ['lv1', 'lv2', 'lv3', 'lv4'];

    levels.forEach(level => {
        const containerId = `fu-${level}`;
        const levelContainer = document.getElementById(containerId);

        console.log(fu_conf[level]["background"]);
        
        const fuItems = fuData[level];
        console.log(fuItems.length);
        Object.keys(window.fusinfo[level]).forEach(key => {
            const fu_info = window.fusinfo[level][key];
            const fu_path = `${level}/${key}`
            // 创建并添加图片元素
            const fuElement = document.createElement('div');
            fuElement.className = `${containerId} fu-item`;  // 添加组合项CSS类
            fuElement.style.position = 'relative';
            fuElement.style.width = '150px';
            fuElement.style.height = '210px';
            fuElement.style.display = 'inline-block';
            fuElement.style.margin = '5px';
            fuElement.style.cursor = 'pointer';
            fuElement.style.transition = 'transform 0.2s ease-in-out';  // 添加过渡动画

            const bgImg = document.createElement('img');
            bgImg.src = `./${fu_conf[level]["background"]}`;
            bgImg.alt = 'Background';
            bgImg.className = 'fu-background-img';  // 添加背景图片的CSS类
            bgImg.style.position = 'absolute';
            bgImg.style.top = '0';
            bgImg.style.left = '0';
            bgImg.style.width = '100%';
            bgImg.style.height = '100%';
            bgImg.style.objectFit = 'contain';
            bgImg.style.zIndex = '1'; // 背景层
            
            // 创建前景图片（护身符图片）
            const fgImg = document.createElement('img');
            fgImg.src = `./${fu_path}`;
            fgImg.alt = fu_info.name || key;
            fgImg.className = 'fu-foreground-img';  // 添加前景图片的CSS类
            fgImg.style.position = 'absolute';
            fgImg.style.top = '50%';      // 垂直居中
            fgImg.style.left = '50%';     // 水平居中
            fgImg.style.transform = 'translate(-50%, -50%)'; // 精确居中调整
            fgImg.style.width = '90%';
            fgImg.style.height = '90%';
            fgImg.style.objectFit = 'contain';
            fgImg.style.zIndex = '2'; // 前景层，显示在背景之上

            fgImg.onerror = function() {
                this.style.display = 'none';
                const errorText = document.createElement('span');
                errorText.textContent = `图片未找到: ${this.src}`;
                errorText.style.color = 'red';
                errorText.style.fontSize = '12px';
                imgContainer.appendChild(errorText);
            };

            fuElement.appendChild(bgImg);
            fuElement.appendChild(fgImg);

            fuElement.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.05)';
            });
            
            fuElement.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
            });
            
            // 添加点击事件
            fuElement.addEventListener('click', function(event) {
                // 这里可以添加点击事件的处理逻辑
                console.log('点击了护身符:', fu_path, fu_info);
                showFuInfo(fu_info,fgImg,event);
            });


            levelContainer.appendChild(fuElement);
        });
    });
}

function showFuInfo(fu_info,fgImg,event) {
    
    let popup = document.getElementById('seal-info-popup');
    if (popup) {
        popup.remove();
    }
    popup = document.createElement('div');
    popup.id = 'seal-info-popup';
    let infoContent ="";
    infoContent += `<img src="${fgImg.src}" alt="${fgImg.alt}" style="max-width: 100%; height: auto; display: block; margin: 0 auto 10px;">`;
    infoContent += `<h2>${fu_info.name}</h2>`;

    infoContent += `<h4>${fu_info.description}  </h4>`;

    if (fu_info.plus) {
        infoContent += `<h4>
                        <span style="
                            display: inline-block;
                            position: relative;
                            background-color: #FFD700;
                        ">Plus:</span> 
        ${fu_info.plus}  </h4>`;
    }
    
    if (fu_info.note) {
        let noteContent = "";
        noteContent += '<div class="notes-section">';
        noteContent +='<div class="note-marker">note</div>'; // 添加note标记
        for(let i=0;i<fu_info.note.length;i++){
            noteContent += `<p><strong>${(i+1)}:</strong> ${fu_info.note.at(i)}</p>`;
        }
        noteContent += '</div>';
        infoContent += noteContent;
    }

    popup.innerHTML = infoContent;
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 999;
    `;
    const x = event.clientX;
    const y = event.clientY;

    const popupWidth = popup.offsetWidth || 340; // 默认宽度
    const popupHeight = popup.offsetHeight || 200; // 默认高度
    let leftPos = x + 20; // 在点击位置右侧20px
    let topPos = y;  // 在点击位置上方10px
    if (leftPos + popupWidth > window.innerWidth) {
        leftPos = x - popupWidth - 10; // 如果超出右边，则显示在左侧
    }
    
    // 检查是否超出底部边界
    if (topPos + popupHeight > window.innerHeight) {
        topPos = window.innerHeight - popupHeight - 10; // 如果超出底部，则调整到可见区域
    }
    
    // 确保不超出顶部
    if (topPos < 0) {
        topPos = 10;
    }
    
    // 确保不超出左边
    if (leftPos < 0) {
        leftPos = 10;
    }
    
    popup.style.left = `${leftPos}px`;
    popup.style.top = `${topPos}px`;
    
    overlay.onclick = function() {
        popup.remove();
        overlay.remove();
    };
    
    document.body.appendChild(overlay);
    document.body.appendChild(popup);

}
