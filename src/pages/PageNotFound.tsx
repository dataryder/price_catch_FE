import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, ButtonIcon } from '@govtechmy/myds-react/button';
import { HomeIcon } from '@govtechmy/myds-react/icon';

const PageNotFound: React.FC = () => {
	const navigate = useNavigate();
	const handleBack = () => navigate('/');
	return (
		<div className="container mx-auto my-10 bg-bg-white 2xl:px-40 text-txt-black-900 justify-center flex flex-col items-center gap-10">
			<div className='font-bold text-3xl text-center'> Page Not Found</div>
			<Button variant='primary-fill' size='medium' onClick={handleBack} className="bg-success-600 border-success-600 hover:bg-success-700">
				<ButtonIcon>
					<HomeIcon />
				</ButtonIcon>
				Back to Home
			</Button>
		</div>
	);
};

export default PageNotFound;