import React from "react"
import { Card, Text, Image, Title, Space, Flex, Stack } from "@mantine/core"
import RoundButton from "./RoundButton"

const EggCard = (props) => {
  // when time is not null, remain time displayed
  const { eggStr, eggIconSrc, eggKey, eggDiff, tv, hp, lp } = props
  const cardWidth = 550
  const cardHeight = 330
  const imageHeight = 330
  return (
    <Card
      p={40}
      radius={24}
      withBorder={false}
      shadow="xs"
      miw={300}
      padding="md"
      w="calc(33% - 16px)"
      bg="dark-grey.0"
      style={{
        flexDirection: "column",
        display: "flex",
      }}
    >
      <Card.Section
        withBorder={true}
        pb={20}
        style={{
          borderColor: "gray",
        }}
      >
        <Flex align="center" direction="row">
          <Image mr={20} width={100} height={100} src={eggIconSrc}></Image>
          <Stack spacing={4}>
            <Title order={3} c={"white.0"}>
              {eggStr}
            </Title>
            <Text order={3} c={"grey.0"}>
              {eggDiff}%
            </Text>
          </Stack>
        </Flex>
      </Card.Section>
      <Card.Section
        mt={20}
        style={{
          display: "flex",
          flexDirection: "column",
          flex: "1 0 auto",
        }}
      >
        <Text size="md" c="grey.0">
          Trading Volumn {tv}
          <br></br>
          Highest Price {hp}
          <br></br>
          Lowest Price {lp}
          <br></br>
        </Text>
        <Space
          style={{
            flex: "1 0 auto",
          }}
        ></Space>
        {/* change later */}
        {/* <RoundButton to={"/buyegg/" + eggKey} text="BUY NOW" size="lg" mt={20} variant="filled" bgColor="custom-orange.1" textColor={"black"} fullWidth></RoundButton> */}
        <RoundButton
          text="BUY NOW"
          size="lg"
          mt={20}
          variant="filled"
          bgColor="custom-orange.1"
          textColor={"black"}
          fullWidth
        ></RoundButton>
      </Card.Section>
    </Card>
  )
}

export default EggCard
