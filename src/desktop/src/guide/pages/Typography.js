import React from 'react';

import Infobox from 'ui/components/Info';

const Typography = () => {
    return (
        <div>
            <h1>Title, Source Sans Pro medium</h1>
            <p>
                Paragraph, Source Sans Pro, 1.6rem. <strong>Bold text, Source Sans Pro Semibold.</strong> Lorem ipsum
                dolor sit amet, consectetur adipiscing elit. Suspendisse in maximus leo. Fusce consectetur eget tellus
                in vulputate.
            </p>
            <hr />
            <h1>Info box element</h1>
            <Infobox>
                <strong>Infobox.</strong> Focus interaction design influencer handshake first mover advantage. Focus
                interaction design influencer handshake first mover advantage. Focus interaction design influencer
                handshake first mover advantage.
            </Infobox>
            <hr />
        </div>
    );
};

export default Typography;
