document.addEventListener('DOMContentLoaded', function() {
    // 预加载图片
    function preloadImages(imageFiles) {
        imageFiles.forEach(filename => {
            const img = new Image();
            img.src = filename;
        });
    }
    
    // 缓存DOM元素引用
    const album = document.querySelector('.album');
    const photos = document.querySelectorAll('.photo');
    const innerPhotos = document.querySelectorAll('.inner-photo');
    const innerAlbum = document.querySelector('.inner-album');
    const allImageFiles = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png'];
    
    // 预加载所有图片
    preloadImages(allImageFiles);
    
    // 为外层图片随机分配唯一图片
    function getUniqueImages(count) {
        const imageFiles = [...allImageFiles]; // 复制数组
        const uniqueImages = [];
        
        for (let i = 0; i < count && imageFiles.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * imageFiles.length);
            uniqueImages.push(imageFiles.splice(randomIndex, 1)[0]);
        }
        
        return uniqueImages;
    }
    
    // 为外层图片分配唯一图片
    const outerImages = getUniqueImages(photos.length);
    photos.forEach((photo, index) => {
        if (outerImages[index]) {
            photo.style.setProperty('--bg-image', `url('${outerImages[index]}')`);
        }
    });
    
    // 为内层图片分配唯一图片
    const innerImages = getUniqueImages(innerPhotos.length);
    innerPhotos.forEach((photo, index) => {
        if (innerImages[index]) {
            // 确保内层图片路径正确
            photo.style.setProperty('--bg-image', `url('${innerImages[index]}')`);
            // 同时设置背景图片作为备份
            photo.style.backgroundImage = `url('${innerImages[index]}')`;
        }
    });
    
    let isPaused = false;
    let animationId = null;
    let startTime = Date.now();
    const duration = 20000; // 20秒一圈

    // 展开立方体的函数
    function expandAlbum() {
        if (!album.classList.contains('expanded')) {
            isPaused = true;
            cancelAnimationFrame(animationId);
            album.classList.add('expanded');
            
            // 确保所有元素显示
            const photos = document.querySelectorAll('.photo');
            const innerAlbum = document.querySelector('.inner-album');
            
            photos.forEach(photo => {
                photo.style.display = 'block';
                photo.style.opacity = '1';
                photo.style.zIndex = '1';
                photo.style.animation = 'none'; // 移除CSS动画
                // 确保初始位置正确
                photo.style.transform = '';
            });
            
            if (innerAlbum) {
                innerAlbum.style.opacity = '1';
                innerAlbum.style.animation = 'none'; // 移除CSS动画
                // 确保初始位置正确
                innerAlbum.style.transform = 'translate(-50%, -50%)';
            }
            
            // 强制重排
            void album.offsetWidth;
            
            // 立即启动同步旋转
            startSyncRotation();
        }
    }
    
    // 同步旋转动画函数
    let syncAnimationId = null;
    let syncStartTime = 0;
    
    function startSyncRotation() {
        // 清除之前的动画
        if (syncAnimationId) {
            cancelAnimationFrame(syncAnimationId);
        }
        
        syncStartTime = Date.now();
        syncAnimate();
    }
    
    function syncAnimate() {
        if (!album.classList.contains('expanded')) return;
        
        const elapsed = (Date.now() - syncStartTime) / 10000; // 10秒/圈
        const rotation = (elapsed * 360) % 360;
        
        // 使用缓存的元素引用
        if (photos.length > 0) {
            photos.forEach((photo, index) => {
                let baseRotation = 0;
                switch(index) {
                    case 0:
                        baseRotation = 0;
                        break;
                    case 1:
                        baseRotation = 180;
                        break;
                    case 2:
                        baseRotation = -90;
                        break;
                    case 3:
                        baseRotation = 90;
                        break;
                    case 4:
                        baseRotation = 90;
                        break;
                    case 5:
                        baseRotation = -90;
                        break;
                }
                
                if (index < 4) {
                    // 前、后、左、右四个面
                    photo.style.transform = `rotateX(${rotation}deg) rotateY(${rotation + baseRotation}deg) translateZ(300px)`;
                } else {
                    // 上、下两个面
                    photo.style.transform = `rotateX(${rotation + baseRotation}deg) rotateY(${rotation}deg) translateZ(300px)`;
                }
            });
        }
        
        // 控制内层小正方体旋转
        if (innerAlbum) {
            innerAlbum.style.transform = `translate(-50%, -50%) rotateX(${rotation}deg) rotateY(${rotation}deg)`;
        }
        
        // 确保动画继续
        syncAnimationId = requestAnimationFrame(syncAnimate);
    }

    // 收缩立方体的函数
    function collapseAlbum() {
        if (album.classList.contains('expanded')) {
            // 立即停止同步旋转动画
            cancelAnimationFrame(syncAnimationId);
            
            // 移除展开类，触发收缩过渡动画
            album.classList.remove('expanded');
            
            // 延迟恢复初始旋转，确保收缩过渡动画完成
            setTimeout(() => {
                isPaused = false;
                startTime = Date.now() - (album.style.getPropertyValue('--rotation') || 0) * duration / 360;
                animate();
            }, 800); // 与过渡时间匹配
            
            // 确保内层立方体隐藏
            const innerAlbum = document.querySelector('.inner-album');
            if (innerAlbum) {
                innerAlbum.style.opacity = '0';
            }
        }
    }

    // 状态变量
    let isClickExpanded = false; // 点击展开状态
    let isHoverExpanded = false; // 鼠标悬停状态

    // 点击时展开/收缩立方体
    album.addEventListener('click', function() {
        if (isClickExpanded) {
            // 点击收缩
            collapseAlbum();
            isClickExpanded = false;
        } else {
            // 点击展开
            expandAlbum();
            isClickExpanded = true;
        }
    });

    // 鼠标悬停时展开立方体
    album.addEventListener('mouseenter', function() {
        if (!isClickExpanded) {
            // 只有在非点击展开状态下才响应鼠标悬停
            expandAlbum();
            isHoverExpanded = true;
        }
    });

    // 鼠标离开时收缩立方体
    album.addEventListener('mouseleave', function() {
        if (!isClickExpanded && isHoverExpanded) {
            // 只有在非点击展开状态下才响应鼠标离开
            collapseAlbum();
            isHoverExpanded = false;
        }
    });

    // 平滑旋转动画（对角线旋转）
    function animate() {
        if (isPaused) return;
        
        const elapsed = Date.now() - startTime;
        const rotation = (elapsed / duration) * 360 % 360;
        
        album.style.setProperty('--rotation', rotation);
        album.style.transform = `rotateX(${rotation}deg) rotateY(${rotation}deg)`;
        
        animationId = requestAnimationFrame(animate);
    }

    // 初始化动画
    animate();

    // 添加滚动视差效果
    window.addEventListener('scroll', function() {
        const scrollY = window.scrollY;
        const container = document.querySelector('.container');
        container.style.transform = `translateY(${scrollY * 0.1}px)`;
    });

    // 添加响应式调整
    function updateAlbumSize() {
        const width = window.innerWidth;
        const album = document.querySelector('.album');
        const photos = document.querySelectorAll('.photo');
        const innerAlbum = document.querySelector('.inner-album');
        const innerPhotos = document.querySelectorAll('.inner-photo');
        const isExpanded = album.classList.contains('expanded');
        
        if (width < 768) {
            album.style.width = '150px';
            album.style.height = '150px';
            photos.forEach((photo, index) => {
                photo.style.width = '150px';
                photo.style.height = '150px';
                // 重新设置立方体位置
                if (isExpanded) {
                    switch(index) {
                        case 0:
                            photo.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(200px)';
                            break;
                        case 1:
                            photo.style.transform = 'rotateX(0deg) rotateY(180deg) translateZ(200px)';
                            break;
                        case 2:
                            photo.style.transform = 'rotateX(0deg) rotateY(-90deg) translateZ(200px)';
                            break;
                        case 3:
                            photo.style.transform = 'rotateX(0deg) rotateY(90deg) translateZ(200px)';
                            break;
                        case 4:
                            photo.style.transform = 'rotateX(90deg) rotateY(0deg) translateZ(200px)';
                            break;
                        case 5:
                            photo.style.transform = 'rotateX(-90deg) rotateY(0deg) translateZ(200px)';
                            break;
                    }
                    // 应用移动设备旋转动画
                    photo.style.animation = 'mobile-outer-rotate 10s linear infinite';
                } else {
                    switch(index) {
                        case 0:
                            photo.style.transform = 'rotateY(0deg) translateZ(75px)';
                            break;
                        case 1:
                            photo.style.transform = 'rotateY(180deg) translateZ(75px)';
                            break;
                        case 2:
                            photo.style.transform = 'rotateY(-90deg) translateZ(75px)';
                            break;
                        case 3:
                            photo.style.transform = 'rotateY(90deg) translateZ(75px)';
                            break;
                        case 4:
                            photo.style.transform = 'rotateX(90deg) translateZ(75px)';
                            break;
                        case 5:
                            photo.style.transform = 'rotateX(-90deg) translateZ(75px)';
                            break;
                    }
                    // 移除动画
                    photo.style.animation = 'none';
                }
            });
            
            // 调整内层小立方体
            if (innerAlbum) {
                innerAlbum.style.width = '75px';
                innerAlbum.style.height = '75px';
            }
            if (innerPhotos.length > 0) {
                innerPhotos.forEach((innerPhoto, index) => {
                    innerPhoto.style.width = '75px';
                    innerPhoto.style.height = '75px';
                    switch(index) {
                        case 0:
                            innerPhoto.style.transform = 'rotateY(0deg) translateZ(37.5px)';
                            break;
                        case 1:
                            innerPhoto.style.transform = 'rotateY(180deg) translateZ(37.5px)';
                            break;
                        case 2:
                            innerPhoto.style.transform = 'rotateY(-90deg) translateZ(37.5px)';
                            break;
                        case 3:
                            innerPhoto.style.transform = 'rotateY(90deg) translateZ(37.5px)';
                            break;
                        case 4:
                            innerPhoto.style.transform = 'rotateX(90deg) translateZ(37.5px)';
                            break;
                        case 5:
                            innerPhoto.style.transform = 'rotateX(-90deg) translateZ(37.5px)';
                            break;
                    }
                });
            }
        } else {
            album.style.width = '200px';
            album.style.height = '200px';
            photos.forEach((photo, index) => {
                photo.style.width = '200px';
                photo.style.height = '200px';
                // 重新设置立方体位置
                if (isExpanded) {
                    switch(index) {
                        case 0:
                            photo.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(300px)';
                            break;
                        case 1:
                            photo.style.transform = 'rotateX(0deg) rotateY(180deg) translateZ(300px)';
                            break;
                        case 2:
                            photo.style.transform = 'rotateX(0deg) rotateY(-90deg) translateZ(300px)';
                            break;
                        case 3:
                            photo.style.transform = 'rotateX(0deg) rotateY(90deg) translateZ(300px)';
                            break;
                        case 4:
                            photo.style.transform = 'rotateX(90deg) rotateY(0deg) translateZ(300px)';
                            break;
                        case 5:
                            photo.style.transform = 'rotateX(-90deg) rotateY(0deg) translateZ(300px)';
                            break;
                    }
                    // 应用桌面旋转动画
                    photo.style.animation = 'outer-rotate 10s linear infinite';
                } else {
                    switch(index) {
                        case 0:
                            photo.style.transform = 'rotateY(0deg) translateZ(100px)';
                            break;
                        case 1:
                            photo.style.transform = 'rotateY(180deg) translateZ(100px)';
                            break;
                        case 2:
                            photo.style.transform = 'rotateY(-90deg) translateZ(100px)';
                            break;
                        case 3:
                            photo.style.transform = 'rotateY(90deg) translateZ(100px)';
                            break;
                        case 4:
                            photo.style.transform = 'rotateX(90deg) translateZ(100px)';
                            break;
                        case 5:
                            photo.style.transform = 'rotateX(-90deg) translateZ(100px)';
                            break;
                    }
                    // 移除动画
                    photo.style.animation = 'none';
                }
            });
            
            // 调整内层小立方体
            if (innerAlbum) {
                innerAlbum.style.width = '100px';
                innerAlbum.style.height = '100px';
            }
            if (innerPhotos.length > 0) {
                innerPhotos.forEach((innerPhoto, index) => {
                    innerPhoto.style.width = '100px';
                    innerPhoto.style.height = '100px';
                    switch(index) {
                        case 0:
                            innerPhoto.style.transform = 'rotateY(0deg) translateZ(50px)';
                            break;
                        case 1:
                            innerPhoto.style.transform = 'rotateY(180deg) translateZ(50px)';
                            break;
                        case 2:
                            innerPhoto.style.transform = 'rotateY(-90deg) translateZ(50px)';
                            break;
                        case 3:
                            innerPhoto.style.transform = 'rotateY(90deg) translateZ(50px)';
                            break;
                        case 4:
                            innerPhoto.style.transform = 'rotateX(90deg) translateZ(50px)';
                            break;
                        case 5:
                            innerPhoto.style.transform = 'rotateX(-90deg) translateZ(50px)';
                            break;
                    }
                });
            }
        }
    }

    // 监听窗口大小变化
    window.addEventListener('resize', updateAlbumSize);
    
    // 监听展开状态变化
    album.addEventListener('transitionend', updateAlbumSize);
});