import React, { useEffect, useState } from 'react';
import { Button, Container, Image, Title, Group, BackgroundImage, Text } from '@mantine/core';

import background from '../../../images/game/race/background.png';
import cockie1_1 from '../../../images/game/race/chick_racing_1_1.png';
import cockie1_2 from '../../../images/game/race/chick_racing_1_2.png';
import cockie1_3 from '../../../images/game/race/chick_racing_1_3.png';
import cockie2_1 from '../../../images/game/race/chick_racing_2_1.png';
import cockie2_2 from '../../../images/game/race/chick_racing_2_2.png';
import cockie2_3 from '../../../images/game/race/chick_racing_2_3.png';
import cockie3_1 from '../../../images/game/race/chick_racing_3_1.png';
import cockie3_2 from '../../../images/game/race/chick_racing_3_2.png';
import cockie3_3 from '../../../images/game/race/chick_racing_3_3.png';
import cockie4_1 from '../../../images/game/race/chick_racing_4_1.png';
import cockie4_2 from '../../../images/game/race/chick_racing_4_2.png';
import cockie4_3 from '../../../images/game/race/chick_racing_4_3.png';

// Array of horse images
const racerImg1 = [
    cockie1_1,
    cockie1_2,
    cockie1_3,
];

const racerImg2 = [
    cockie2_1,
    cockie2_2,
    cockie2_3,
];

const racerImg3 = [
    cockie3_1,
    cockie3_2,
    cockie3_3,
];

const racerImg4 = [
    cockie4_1,
    cockie4_2,
    cockie4_3,
];

const horseImages = [racerImg1, racerImg2, racerImg3, racerImg4];
const finishLine = 800;  // Finish line position (pixels)

const HorseRace = () => {
    const [positions, setPositions] = useState([0, 0, 0, 0]);
    const [isRacing, setIsRacing] = useState(false);
    const [containerWidth, setContainerWidth] = useState<number>(0);
    const [imageIndices, setImageIndices] = useState([0, 0, 0, 0]);
    const [direction, setDirection] = useState([1, 1, 1, 1]); // 1 for forward, -1 for backward
    const [fastestRacer, setFastestRacer] = useState<number | null>(null);
    const [winner, setWinner] = useState<number | null>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Adjust image positions on resize to ensure they fit within the container
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };

        window.addEventListener('resize', updateSize);
        updateSize();  // Initialize size on mount

        return () => window.removeEventListener('resize', updateSize);
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRacing) {
            interval = setInterval(() => {
                setPositions(prevPositions => {
                    const newPositions = prevPositions.map((position, index) => {
                        const increment = Math.floor(Math.random() * 10);
                        const newPosition = position + increment;
                        if (newPosition >= finishLine) {
                            if (winner === null) {
                                setWinner(index);
                            }
                            return finishLine; // Racer stops at the finish line
                        }
                        return newPosition;
                    });
                    const leadingPosition = Math.max(...newPositions);
                    const leadingRacer = newPositions.indexOf(leadingPosition);
                    setFastestRacer(leadingRacer);
                    return newPositions;
                });

                setImageIndices(prevIndices => prevIndices.map((index, i) => {
                    if (direction[i] === 1) {
                        if (index === 2) {
                            setDirection(prevDirection => {
                                const newDirection = [...prevDirection];
                                newDirection[i] = -1;
                                return newDirection;
                            });
                            return index - 1;
                        }
                        return index + 1;
                    } else {
                        if (index === 0) {
                            setDirection(prevDirection => {
                                const newDirection = [...prevDirection];
                                newDirection[i] = 1;
                                return newDirection;
                            });
                            return index + 1;
                        }
                        return index - 1;
                    }
                }));
            }, 100);
        }
        return () => clearInterval(interval);
    }, [isRacing, containerWidth, direction, winner]);

    const resetRace = () => {
        setPositions([0, 0, 0, 0]);
        setImageIndices([0, 0, 0, 0]);
        setDirection([1, 1, 1, 1]);
        setIsRacing(false);
        setFastestRacer(null);
        setWinner(null);
    };

    return (
        <Container ref={containerRef}>
            <Title order={2} style={{ textAlign: 'center' }}>Horse Racing Game</Title>
            <Group position="center" style={{ marginBottom: 20 }}>
                <BackgroundImage src={background} style={{ width: '100%', height: '600px', position: 'relative' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', height: '100%' }}>
                        {positions.map((position, index) => (
                            <div key={index} style={{ position: 'absolute', top: `${index * 100 + 100}px`, left: `${position}px`, width: '200px', height: '50px', display: winner === null ? 'block' : 'none' }}>
                                <Image src={horseImages[index][imageIndices[index]]} alt={`Horse ${index + 1}`} style={{ transition: 'margin-left 0.5s', width: '100%', height: '100%' }} />
                            </div>
                        ))}
                    </div>
                </BackgroundImage>
            </Group>

            {fastestRacer !== null && winner === null && (
                <Text align="center" size="lg" color="blue">Fastest Racer: {`Racer ${fastestRacer + 1}`}</Text>
            )}

            {winner !== null && (
                <Text align="center" size="xl" color="green" mt="md">{`Winner: Racer ${winner + 1}`}</Text>
            )}

            <Group position="center" style={{ marginTop: 100 }}>
                <Button color="blue" onClick={() => setIsRacing(!isRacing)}>
                    {isRacing ? 'Pause Race' : 'Start Race'}
                </Button>
                <Button color="red" onClick={resetRace}>
                    Reset Race
                </Button>
            </Group>
        </Container>
    );
};

export default HorseRace;