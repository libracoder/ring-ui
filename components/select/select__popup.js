/**
 * @description Displays a popup with select's options.
 */

import React from 'react';
import {findDOMNode} from 'react-dom';
import RingComponentWithShortcuts from '../ring-component/ring-component_with-shortcuts';
import Popup from '../popup/popup';
import List from '../list/list';
import Input from '../input-legacy/input-legacy';
import LoaderInline from '../loader-inline/loader-inline';
import classNames from 'classnames';

import {filterWrapper} from '../popup/popup.css';

function noop() {}

export default class SelectPopup extends RingComponentWithShortcuts {
  isClickingPopup = false; // This flag is to true while an item in the popup is being clicked

  static defaultProps = {
    data: [],
    activeIndex: null,
    toolbar: null,
    filter: false, // can be either boolean or an object with "value" and "placeholder" properties
    message: null,
    anchorElement: null,
    maxHeight: 250,
    loading: false,
    minWidth: Popup.PopupProps.MinWidth.TARGET,
    onSelect: noop,
    onCloseAttempt: noop,
    onFilter: noop,
    onLoadMore: noop
  };

  state = {
    popupShortcuts: false
  };

  constructor() {
    super();
    this.mouseUpHandler = ::this.mouseUpHandler;
  }

  didMount() {
    window.document.addEventListener('mouseup', this.mouseUpHandler);
  }

  willReceiveProps(nextProps) {
    if (nextProps.hidden !== this.props.hidden) {
      this.setState({
        popupShortcuts: !nextProps.hidden,
        shortcuts: !nextProps.hidden && this.props.filter
      });
    }
  }

  willUnmount() {
    window.document.removeEventListener('mouseup', this.mouseUpHandler);
  }

  getShortcutsProps() {
    return {
      map: {
        tab: ::this.tabPress
      },
      scope: ::this.constructor.getUID('ring-select-popup-')
    };
  }

  listOnMouseOut() {
    this.list.clearSelected();
  }

  mouseDownHandler() {
    this.isClickingPopup = true;
  }

  mouseUpHandler() {
    this.isClickingPopup = false;
  }

  listScrollToIndex(index) {
    this.list && this.list.setActiveItem(index);
  }

  isVisible() {
    return this.popup && this.popup.isVisible();
  }

  onListSelect(selected) {
    const getSelectItemEvent = () => {
      let event;
      if (document.createEvent) {
        event = document.createEvent('Event');
        event.initEvent('select', true, false);
      }
      return event;
    };

    this.props.onSelect(selected, getSelectItemEvent());
  }

  tabPress(event) {
    event.preventDefault();
    const listActiveItem = this.list.state.activeItem;
    if (listActiveItem) {
      this.onListSelect(listActiveItem);
    }
    this.props.onCloseAttempt();
  }

  getFilter() {
    if (this.props.filter) {
      return (
        <div className={filterWrapper}>
          <Input
            defaultValue={this.props.filter.value || ''}
            ref={el => {
              this.filter = el;
              if (el) {
                findDOMNode(el).focus();
              }
            }}
            className="ring-js-shortcuts ring-input_filter-popup"
            placeholder={this.props.filter.placeholder || ''}
            onInput={this.props.onFilter}
          />
        </div>
      );
    }

    return null;
  }

  getBottomLine() {
    return (<div>
      {this.props.loading && <LoaderInline/>}

      {this.props.message &&
      <div className="ring-select__message">{this.props.message}</div>}
    </div>);
  }

  getList() {
    if (this.props.data.length) {
      return (
        <List
          maxHeight={this.props.maxHeight}
          data={this.props.data}
          activeIndex={this.props.activeIndex}
          ref={el => {
            this.list = el;
          }}
          restoreActiveIndex={true}
          activateSingleItem={true}
          onSelect={::this.onListSelect}
          onMouseOut={::this.listOnMouseOut}
          onScrollToBottom={::this.props.onLoadMore}
          shortcuts={this.state.popupShortcuts}
          disableMoveDownOverflow={this.props.loading}
        />
      );
    }

    return null;
  }

  render() {
    const classes = classNames(
      'ring-select-popup',
      this.props.className
    );

    return (
      <Popup
        ref={el => {
          this.popup = el;
        }}
        hidden={this.props.hidden}
        attached={false}
        className={classes}
        dontCloseOnAnchorClick={true}
        keepMounted={true}
        anchorElement={this.props.anchorElement}
        minWidth={this.props.minWidth}
        onCloseAttempt={this.props.onCloseAttempt}
        directions={this.props.directions}
        top={this.props.top}
        left={this.props.left}
        onMouseDown={::this.mouseDownHandler}
      >
        {this.getFilter()}
        {this.getList()}
        {this.getBottomLine()}
        {this.props.toolbar}
      </Popup>
    );
  }
}
