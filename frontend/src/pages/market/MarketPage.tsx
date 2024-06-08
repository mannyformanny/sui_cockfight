import { Flex, Title, Text, Tabs, Group } from "@mantine/core"
import EggCard from "../../components/EggCard"
import * as React from "react"
import { useStyles } from "../../styles/style"
import { useNavigate, Link } from "react-router-dom"
import RoundButton from "../../components/RoundButton"

import usdt from "../../images/token/USDT.png"
import usdc from "../../images/token/USDC.png"
import eth from "../../images/token/ETH.png"
import tia from "../../images/token/TIA.png"
import sui from "../../images/token/SUI.png"

const MarketPage = () => {
  const { classes } = useStyles()
  const height = 60
  let value = "egg"
  const navigate = useNavigate()

  return (
    <Flex className={classes.frameFlex} align="flex-start">
      <Tabs
        size="lg"
        defaultValue={value}
        styles={(theme) => ({
          tab: {
            padding: `0 12px`,
            lineHeight: height + "px",
            fontWeight: "bold",
            color: theme.colors["white"][0],
            border: "none",
            "&[data-active]": {
              color: theme.colors["custom-orange"][1],
            },
            "&:hover": {
              background: "none",
            },
          },
          tabsList: {
            borderBottom: "none",
          },
          borderBottom: "none",
        })}
      >
        <Tabs.List position="left" grow={true}>
          <Tabs.Tab value="chicken" c="">
            CHICKEN
          </Tabs.Tab>
          <Tabs.Tab value="egg">EGG</Tabs.Tab>
        </Tabs.List>
      </Tabs>
      <Title
        mt={40}
        mb={40}
        order={2}
        c={"white.0"}
        style={{
          textAlign: "start",
        }}
      >
        EGG MARKET
      </Title>
      <Text size={20} weight={600} c={"white.0"} mb={20}>
        There are various types of eggs depending on the underlying asset. For example, if you have a chicken by staking
        ETH, your chicken lays ETH eggs. Even if you don't have chickens, you can participate in the game by purchasing
        as many eggs as you want from the egg market
      </Text>
      <Group mb={80}>
        <RoundButton text="STABLE" size="lg" variant="outline" textColor={"white.0"}></RoundButton>
        <RoundButton text="VOLATILE" size="lg" variant="outline" textColor={"white.0"}></RoundButton>
      </Group>
      <Flex direction="row" wrap="wrap" gap={16} w="100%">
        <EggCard
          eggStr="USDC"
          eggIconSrc={usdc}
          eggKey="USDC"
          eggDiff="0.4"
          tv="$5922.49"
          hp="$0.15"
          lp="$0.13"
        ></EggCard>
        <EggCard eggStr="ETH" eggIconSrc={eth} eggKey="ETH" eggDiff="2.5" tv="$1294.62" hp="$4.13" lp="$2.13"></EggCard>
        <EggCard
          eggStr="SUI"
          eggIconSrc={sui}
          eggKey="SUI"
          eggDiff="3.7"
          tv="$9892.19"
          hp="$8.23"
          lp="$5.32"
        ></EggCard>
        <EggCard
          eggStr="USDT"
          eggIconSrc={usdt}
          eggKey="USDT"
          eggDiff="0.5"
          tv="$6322.23"
          hp="$0.16"
          lp="$0.13"
        ></EggCard>
        <EggCard eggStr="TIA" eggIconSrc={tia} eggKey="TIA" eggDiff="4.2" tv="$3021.59" hp="$2.14" lp="$1.23"></EggCard>
      </Flex>
    </Flex>
  )
}

export default MarketPage
