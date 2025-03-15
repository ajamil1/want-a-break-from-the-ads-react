import React, { useEffect, useState } from 'react';

const GlowingImage = ({image, hasHoles}) => {
    const logobg = React.createRef();
	const logo = React.createRef();

	useEffect(() => {
		//draw svg to canvas
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d');
		//disable image smoothing
		ctx.imageSmoothingEnabled = false;
		canvas.width = logo.current.width;
		canvas.height = logo.current.height;

		const img = new Image();
		//set canvas size to same as logo
		img.src = image;
		img.onload = () => {
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
		}

		logo.current.addEventListener('mouseleave', (e) => {
			logobg.current.classList.remove('hoverglow');
		})
		logo.current.addEventListener('mousemove', (e) => {
			//get mouse position on logo ignoring any padding
			const computedStyle = window.getComputedStyle(logo.current);

			const rect = logo.current.getBoundingClientRect();
			const x = e.clientX - rect.left - computedStyle.paddingLeft.replace('px', '');
			const y = e.clientY - rect.top - computedStyle.paddingTop.replace('px', '');
			const pixel = ctx.getImageData(x, y, 1, 1).data;
			if (pixel[3] == 255 || hasHoles) {
				logobg.current.classList.add('hoverglow');
			} else {
				logobg.current.classList.remove('hoverglow');
			}
		});

	})

  return (
    <div>
        <img src={image} className="logobg" ref={logobg} />
        <img src={image} className="logo" ref={logo} />
    </div>
  );
};

export default GlowingImage;
