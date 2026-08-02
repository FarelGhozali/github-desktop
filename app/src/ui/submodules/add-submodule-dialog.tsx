import * as React from 'react'
import { Dispatcher } from '../dispatcher'
import { Repository } from '../../models/repository'
import { Dialog, DialogContent, DialogFooter } from '../dialog'
import { OkCancelButtonGroup } from '../dialog/ok-cancel-button-group'
import { TextBox } from '../lib/text-box'
import { addSubmodule } from '../../lib/git/submodule'

interface IAddSubmoduleProps {
  readonly dispatcher: Dispatcher
  readonly repository: Repository
  readonly onDismissed: () => void
}

interface IAddSubmoduleState {
  readonly url: string
  readonly path: string
  readonly loading: boolean
}

export class AddSubmodule extends React.Component<
  IAddSubmoduleProps,
  IAddSubmoduleState
> {
  public constructor(props: IAddSubmoduleProps) {
    super(props)
    this.state = {
      url: '',
      path: '',
      loading: false,
    }
  }

  public render() {
    return (
      <Dialog
        id="add-submodule"
        title={__DARWIN__ ? 'Add Submodule' : 'Add submodule'}
        onDismissed={this.props.onDismissed}
        onSubmit={this.onSubmit}
        loading={this.state.loading}
      >
        <DialogContent>
          <TextBox
            label="Repository URL"
            placeholder="https://github.com/user/repo.git"
            value={this.state.url}
            onValueChanged={this.onUrlChange}
            autoFocus={true}
          />
          <TextBox
            label="Local Path"
            placeholder="vendor/my-submodule"
            value={this.state.path}
            onValueChanged={this.onPathChange}
          />
        </DialogContent>
        <DialogFooter>
          <OkCancelButtonGroup
            okButtonText="Add Submodule"
            okButtonDisabled={
              this.state.url.length === 0 || this.state.path.length === 0
            }
          />
        </DialogFooter>
      </Dialog>
    )
  }

  private onUrlChange = (url: string) => {
    this.setState({ url })
  }

  private onPathChange = (path: string) => {
    this.setState({ path })
  }

  private onSubmit = async () => {
    this.setState({ loading: true })
    try {
      await addSubmodule(
        this.props.repository,
        this.state.url,
        this.state.path
      )
      this.props.onDismissed()
    } catch (e) {
      this.props.dispatcher.postError(e)
      this.setState({ loading: false })
    }
  }
}
