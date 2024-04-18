import React from 'react';

const AvatarMeta = ( {idx} ) => {

    return (
        <>
            <img src={`https://rapidprototype.s3.us-east-2.amazonaws.com/Subject${idx == 1 ? "+2":""}.png`} alt="Circular Image" className="object-cover rounded-full overflow-hidden" />
        </>

    );
};

export default AvatarMeta;