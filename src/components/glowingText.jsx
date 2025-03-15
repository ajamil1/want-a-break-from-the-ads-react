import React, { useEffect, useState } from 'react';

const GlowingText = ({ children }) => {
	return (
		<div className='textContainer'>
			<div className='textGlow'>
				{children}
			</div>
			<div className='textmain'>
				{children}
			</div>
		</div>
	);
};

export default GlowingText;
