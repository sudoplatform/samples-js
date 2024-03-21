import { ListOutput } from '@sudoplatform/sudo-common'
import {
  CreditCardNetwork,
  FundingSource,
  FundingSourceFlags,
  FundingSourceState,
  FundingSourceType,
} from '@sudoplatform/sudo-virtual-cards'
import { Button } from '@sudoplatform/web-ui'
import { Avatar, List, Image } from 'antd'
import React, { useContext } from 'react'
import useAsyncFn, { AsyncState } from 'react-use/lib/useAsyncFn'
import { AppContext } from '../../containers/AppContext'

const mastercard_logo_png =
  'iVBORw0KGgoAAAANSUhEUgAAAEoAAAA0CAYAAAAt+K7AAAAACXBIWXMAAAsSAAALEgHS3X78AAADn0lEQVRoge2azU4TURTH/50OhZICjaHBZAw2wT24cimsXIpPAO0LqE+gPIGYuC59A3DpCnyDspeEGLsaQoo2lH6OuZNbUnTaOffOuSJ6f8ms5n6c859z536cC4vFYrFYLBaLFimTsvnwigCKEa9qBdQbOm22Kl4ewFrEq9NsuX6q0yYFVqF8hE5sAngOYB1AfkJx4dQRgI8F1A8mtduqeKKtLdlmlPBDGsM2ARxky3ofIwoWoaRArwC8jBFnHEK0nQLq1dH3rYq3DeBNjDjjECK9B7DLIVhioXx4IoL2NAX6lRqAUq4SOrknIygpoq1Stjw5auNIJJQPTzizzeDMNanMALkPaASuwyH8KNVsuV7Stku3oimRFp6dIb0MdFYXEbgOZ/OQEbuhMxS1LDEpknuvi1Szi8zxGVK9AWcXkLPlvk5FZaF8eG+5RRLMb5yHIg0ZimWA9VbFe6farNLQ8xFO04fcts+u/cDs6vfId/0HOXRXFri7hByCR9TCqhGl/CXiSOf6Y0USpL814TS71OZU2FMpTBbKR7imiVoRJ2KSSEPckwvubgVFuU4joRJRW9yWimiafnQZW85ptJG66nN3D7mYJUESSu7ZOBZ/N8gst8hl3XqTu3vIqCKNEmpEbSazJ5rplfhoGuKc0UVVhOQbVainJiwcXQ7EIYaeoeFH8o0qlM6mdCJT99vKdVJXPW4zQPWNKhT7bJfKBMp1DC0TWIViR2XYXdNXF5eLWxPqrnFrQvXOp+6UVFShatwdBx31E57BQobbDMiDvVioQrEf2utEVDDjcpsBahBQhfqczJbfCTqOkljBTDp8DEDyjSpUovPmcbRPZsllB4tZEyaA6htJqALCfBn7f6rzle58f4kuqgIiF8g69CBTP6z0m2m0v8QLMMhPY5AzMkvuUAuShZI5N/aoujyejy3TM3PCKaKpSigXorqOeq1uz2REVE0SSxwFG4omJV+UhCogPGPeVTYphsvaXOQMGOSm0Hs4x90dpA9HrYp3SD3l1Mrr+fD2uc+oRtNVIa6D9pMlI7m9bLn+WLWSrhUl7v+VWFddfFoMI0usl0wmQHUq/lcpdfFf0r2wkeiTFRDm8l9Q90sEakHHeRy4zgZjxDakQKUkt1r+5Ws/SBpFo5i8SBb3s2/I7QPlItlom3EfYniRrPrXXSQbh48wFZSXEVGUw0kYfyq3Rcq0KjeuO67LaBRPg7odsVgsFovFYrH8IQD8BAkkH/VJeDRYAAAAAElFTkSuQmCC'
const visa_logo_png =
  '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'
const amex_logo_png =
  'iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAACXBIWXMAAAsSAAALEgHS3X78AAADH0lEQVR42u2cu4oVQRCGz3P4Ej6DgU/gIxhtZGBivLEIBsYrRkaCqRgIZiIIwsKKqAheQPCCgiIII//h1FL7b1X3nHVRu+YvKM7OmZ5e5pu6dfVwVtM0raQnV0EQQAEUQAGUCqAACqAASgVQAAVQAKV/D+D5a88+V9B/BnB16clUQQVQAAVQAAVQAAVQAP9Az1x5Ol2/9z7Vy7dfr8ed3d1vjjO9cOP54dy9a0oA3L37ZuoJQADMHLm//+Vw7juPP/aGjw/w7aef6zvB56MX346onQMID5DHmXrgmPvrj1/r44N337PxYwOEe5pc3Ht57LyH5sdm8wEUBFaN+SCAWDYGmtXA0npQ7LMF0CCbNUNuPvxQE+C5qwdHrGuOlfYAIiGZ25rg/5QEaAEeN4wb95nTYhjHyR5AThywWgZcAiAAmaCc8OfgcvzdpuQIASJOejA+biIWsjWXAOiBsLXBIjnwA1ALIIMxi/Vg4cr8YIYE6OMU3C2LdwzFuyYDZFeF5fHcOC4B0EPiAA/3tRqNb9a7fVTqeEvG31wW4aGVAGjuBUgnLXsigK1yxR7a8ACtuM0K554arOi7Vi2J5V0JgFnhjLgIEJFy6cHX+qwbPZRWxh8KoL8RThBRsdwamwHkxMEZf2iAWeHsl2uR9Iph7tJEFjs8QF/HAWDWRckk675AGT53Xrxwx2cYgLyS+I9kDIAobKOOsLeQOd3mTFHCtMSKaOpGj9/O8pa57XVzujZZYnGrmmUChOVGYBhiB15dgMisLZf1rf5sjyU65119A7ImwG2STgaxZZ12TVmAuNlW6cJd5whYD15pgHOXhK0VSw+eAHZWLNEqp0xHugfQNtIz5dUHkgov4fwqyI/3DQclkc3SsLXzxhD9+MUDjODhGBbJ30cQFx0DM3iWoeecXzTAyMJ4/xiQeNfPQ1wswJZ7WmPCZ2dOMO6tiDoAT0usVGl1uUuuhU9DeGduxvxjA+zVe9tqtpOXqd6R1jvSAiiAAiiAAiiAArid7tx69aCC6jcT9KMTAiiAUgEUQAEUQKkACqAACqBUAAVQABeivwEB6ybS5p/kIgAAAABJRU5ErkJggg=='
const discover_logo_png =
  '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'

const card_logos: Partial<
  Record<CreditCardNetwork, { type: string; data: string }>
> = {
  [CreditCardNetwork.Amex]: { type: 'image/png', data: amex_logo_png },
  [CreditCardNetwork.Discover]: { type: 'image/png', data: discover_logo_png },
  [CreditCardNetwork.Mastercard]: {
    type: 'image/png',
    data: mastercard_logo_png,
  },
  [CreditCardNetwork.Visa]: { type: 'image/png', data: visa_logo_png },
}

interface Props {
  listFundingSourcesResult: AsyncState<ListOutput<FundingSource>>
  onFundingSourceCancelled?: (fundingSource: FundingSource) => void
  onFundingSourceRefreshed?: (fundingSource: FundingSource) => void
  onFundingSourceReviewed?: (fundingSource: FundingSource) => void
}

export const FundingSourceList: React.FC<Props> = (props) => {
  const { virtualCardsClient } = useContext(AppContext)
  const [cancelFundingSourceResult, cancelFundingSource] = useAsyncFn(
    async (fundingSource: FundingSource) => {
      await virtualCardsClient.cancelFundingSource(fundingSource.id)
      props.onFundingSourceCancelled?.(fundingSource)
    },
  )
  const [reviewFundingSourceResult, reviewFundingSource] = useAsyncFn(
    async (fundingSource: FundingSource) => {
      await virtualCardsClient.reviewUnfundedFundingSource(fundingSource.id)
      props.onFundingSourceReviewed?.(fundingSource)
    },
  )

  return (
    <List
      dataSource={props.listFundingSourcesResult.value?.items}
      loading={props.listFundingSourcesResult.loading}
      renderItem={(item) => {
        console.log({ item })
        const unfundednessString = item.flags.includes(
          FundingSourceFlags.Unfunded,
        )
          ? ' ***UNFUNDED***'
          : ''
        return (
          <List.Item key={item.id}>
            {item.type === FundingSourceType.CreditCard ? (
              item.state === FundingSourceState.Active ? (
                <>
                  <List.Item.Meta
                    avatar={
                      card_logos[item.network] ? (
                        <Avatar
                          shape={'square'}
                          src={
                            <Image
                              width={'100%'}
                              src={`data:${
                                card_logos[item.network]?.type ?? ''
                              };base64,${card_logos[item.network]?.data ?? ''}`}
                            />
                          }
                        />
                      ) : undefined
                    }
                    title={`Card: ${item.network}`}
                    description={`****${item.last4 ?? ''} (${item.cardType})`}
                  />
                  <Button
                    danger={true}
                    disabled={cancelFundingSourceResult.loading}
                    loading={cancelFundingSourceResult.loading}
                    onClick={() => cancelFundingSource(item)}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <List.Item.Meta
                  avatar={
                    card_logos[item.network] ? (
                      <Avatar
                        shape={'square'}
                        src={
                          <Image
                            width={'100%'}
                            src={`data:${
                              card_logos[item.network]?.type ?? ''
                            };base64,${card_logos[item.network]?.data ?? ''}`}
                          />
                        }
                      />
                    ) : undefined
                  }
                  title={`Card: ${item.network} - Cancelled`}
                  description={`****${item.last4 ?? ''} (${item.cardType})`}
                />
              )
            ) : item.state === FundingSourceState.Active ? (
              <>
                <List.Item.Meta
                  avatar={
                    item.institutionLogo ? (
                      <Avatar
                        shape={'square'}
                        src={
                          <Image
                            width={'100%'}
                            src={`data:${item.institutionLogo.type};base64,${item.institutionLogo.data}`}
                          />
                        }
                      />
                    ) : undefined
                  }
                  title={`Bank Account: ${item.institutionName}`}
                  description={`****${item.last4 ?? ''} (${
                    item.bankAccountType
                  }${unfundednessString})`}
                />
                <Button
                  danger={true}
                  disabled={
                    cancelFundingSourceResult.loading ||
                    unfundednessString.length > 0
                  }
                  loading={cancelFundingSourceResult.loading}
                  onClick={() => cancelFundingSource(item)}
                >
                  Cancel
                </Button>
                <Button
                  danger={true}
                  disabled={
                    reviewFundingSourceResult.loading ||
                    unfundednessString.length == 0
                  }
                  loading={reviewFundingSourceResult.loading}
                  onClick={() => reviewFundingSource(item)}
                >
                  Review
                </Button>
              </>
            ) : item.state === FundingSourceState.Refresh ? (
              <>
                <List.Item.Meta
                  avatar={
                    item.institutionLogo ? (
                      <Avatar
                        shape={'square'}
                        src={
                          <Image
                            width={'100%'}
                            src={`data:${item.institutionLogo.type};base64,${item.institutionLogo.data}`}
                          />
                        }
                      />
                    ) : undefined
                  }
                  title={`Bank Account: ${item.institutionName} - Needs Refreshing`}
                  description={`****${item.last4 ?? ''} (${
                    item.bankAccountType
                  })`}
                />
                <Button
                  danger={true}
                  disabled={cancelFundingSourceResult.loading}
                  loading={cancelFundingSourceResult.loading}
                  onClick={() => cancelFundingSource(item)}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <List.Item.Meta
                avatar={
                  item.institutionLogo ? (
                    <Avatar
                      shape={'square'}
                      src={
                        <Image
                          width={'100%'}
                          src={`data:${item.institutionLogo.type};base64,${item.institutionLogo.data}`}
                        />
                      }
                    />
                  ) : undefined
                }
                title={`Bank Account: ${item.institutionName} - Cancelled`}
                description={`****${item.last4 ?? ''} (${
                  item.bankAccountType
                })`}
              />
            )}
          </List.Item>
        )
      }}
    ></List>
  )
}
