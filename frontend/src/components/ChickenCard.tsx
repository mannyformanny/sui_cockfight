import React, { useState } from 'react';
import { Card, Text, Image, Title, useMantineTheme, Space, Modal, Button, Group} from '@mantine/core';
import RoundButton from './RoundButton';
import { API_URL, CockieType } from '../lib/consts';
import axios from 'axios';
import { useCurrentAccount, useSignAndExecuteTransactionBlock, useSuiClient } from '@mysten/dapp-kit';
import { TransactionBlock, Transactions } from '@mysten/sui.js/transactions';

const PACKAGE_ID = "0xffb0e7da8f9aafb4c181eaefb5948247cb25ab91f324073556a3efe9fd6f6fa5"
const imageWidth = 550;
const cardHeight = 620;
const imageHeight = 360;

const ChickenCard = (props) => {
    const account = useCurrentAccount()
    const suiClient = useSuiClient();
    const { mutate: execMint } = useSignAndExecuteTransactionBlock();

    const { title, src, priceText, text, type } = props;
    
    const [opened, setOpened] = useState(false);
    
    const handleBuyNowClick = () => {
        setOpened(true);
    };

    const onClickButton = async (type: CockieType) => {
        if (!account) {
            alert('Please connect wallet')
            return
        }
        const tx = new TransactionBlock();
        tx.moveCall({
            target: `${PACKAGE_ID}::market::mint`,
            arguments: []
        })

        execMint(
            {
               transactionBlock: tx,
            },
            {
                onError: (error) => {
                    console.error('error: ', error);
                },
                onSuccess: (result) => {
                    console.log('result: ', result);
                }
            }
        )

        const body = {
            address: account!.address,
            type,
            base_coin: "USDC",
            decimal: 8
        }
        try {
            const response = await axios.post(`${API_URL}/market/mint`, body);
            console.log('buy response: ', response);
        } catch (error) {
            console.error('buy error: ', error);
        }
    }
    return (
        <>
            <Card radius={24} withBorder={false} shadow="xs" padding="md" w={imageWidth} bg="dark-grey.0" mih={500} style={{
                flexDirection: 'column',
                display: 'flex'
            }}>
                <Card.Section mt="sm" style={{}}>
                    <Image width={imageWidth} height={imageHeight} src={src}></Image>
                </Card.Section>
                <Card.Section  mt="0" p={20} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: "1 0 auto",
                }}>
                    
                    <Title p="0 0 10px" order={3} c={"white.0"} mb={4} style={{
                        textAlign: "start",
                    }}>{title}</Title>
                    <Title size="md" c="white.0" order={4} mb={12} style={{
                        textAlign: "start",
                    }}>{priceText}</Title>
                    <Text size="md" c="grey.0">{text}</Text>
                    <Space style={{
                        flex: "1 0 auto"
                    }}></Space>
                    <RoundButton text="BUY NOW" size="lg" mt={20} variant="filled" bgColor="custom-orange.1" textColor={"black"} fullWidth onClick={()=>handleBuyNowClick()} ></RoundButton>
                </Card.Section>
            </Card>

            <Modal
                opened={opened}
                onClose={() => setOpened(false)}
                title="Confirm Purchase"
                centered
                overlayColor={"rgba(0, 0, 0, 0.75)"}
                overlayBlur={3}
                styles={{
                    modal: {
                        backgroundColor: '#1A1B1E',
                        padding: '20px',
                        borderRadius: '24px',
                        color: 'white',
                    },
                    title: {
                        color: 'white',
                        marginBottom: '16px',
                    },
                    body: {
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    },
                }}
            >
                <Text size="md" c="grey.0" mb={20}>Are you sure you want to buy this item?</Text>
                <Group position="center">
                    <Button onClick={() => {
                        onClickButton(type);
                        setOpened(false);
                    }}>
                        Confirm
                    </Button>
                    <Button variant="outline" color="gray" onClick={() => setOpened(false)} style={{ marginRight: '10px' }}>
                        Cancel
                    </Button>
                </Group>
            </Modal>
        </>
    );
};

export default ChickenCard;