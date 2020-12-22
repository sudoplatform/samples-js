import {
  AdTrackerBlockerClient,
  RulesetType,
} from '@sudoplatform/sudo-ad-tracker-blocker'
import { Card, Switch, VSpace, Spinner } from '@sudoplatform/web-ui'
import moment from 'moment'
import React from 'react'
import { useAsync, useAsyncFn } from 'react-use'
import { ErrorFeedback } from './ErrorFeedback'
import styled from 'styled-components'

const Table = styled.table`
  width: 100%;
  tr {
    td {
      padding-top: ${({ theme }) => theme.spacing.medium};
    }
    th:nth-child(3),
    td:nth-child(3) {
      text-align: right;
    }
  }
`

const listTypeToLabel = {
  [RulesetType.AdBlocking]: 'Ad Blocking',
  [RulesetType.Privacy]: 'Privacy',
  [RulesetType.Social]: 'Social',
}

interface Props {
  atbClient: AdTrackerBlockerClient
  lastClientChange: number
}

export const Rulesets: React.FC<Props> = ({ atbClient, lastClientChange }) => {
  /**
   * Async effect: Gets lists from SDK client.
   */
  const rulesets = useAsync(async () => atbClient.listRulesets(), [
    lastClientChange,
  ])

  const activeRulesets = useAsync(async () => atbClient.getActiveRulesets(), [
    lastClientChange,
  ])

  /**
   * Async callback: Sets active lists in client
   */
  const [setRulesetsResult, setRulesetActive] = useAsyncFn(
    async (type: RulesetType, active: boolean) => {
      const currentActiveRulesets = await atbClient.getActiveRulesets()
      const updatedActiveRulesets = active
        ? [...currentActiveRulesets, type]
        : currentActiveRulesets.filter((rulesetType) => rulesetType !== type)

      await atbClient.setActiveRulesets(updatedActiveRulesets)
    },
    [atbClient],
  )

  return (
    <Card title="Rulesets">
      {rulesets.error ? (
        <ErrorFeedback
          error={rulesets.error}
          message="An error occurred loading rulesets."
        />
      ) : rulesets.value == undefined ? (
        <Spinner />
      ) : (
        <VSpace>
          <Table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Last Modified</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              {rulesets.value?.map((ls) => (
                <tr key={ls.type}>
                  <td>{listTypeToLabel[ls.type]}</td>
                  <td>{moment(ls.updatedAt).format('lll')}</td>
                  <td>
                    <Switch
                      checked={activeRulesets.value?.some(
                        (rs) => rs === ls.type,
                      )}
                      onChange={(isActive) =>
                        setRulesetActive(ls.type, isActive)
                      }
                      disabled={setRulesetsResult.loading}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {setRulesetsResult.error && (
            <ErrorFeedback
              error={setRulesetsResult.error}
              message="An error occurred when trying to set active rulesets."
            />
          )}
        </VSpace>
      )}
    </Card>
  )
}
