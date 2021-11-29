A small FoundryVTT module that allows tracking of Actor modification history.

## Checklist

- Add UI and decide how to actually view the history (settings -> view all owned Actors + filter? Or button on sheet? Button on sheet -> view how GM Notes does
  it)
  - Store and view what specifically was changed, not just "everything"
- Implement option for NPC tracking
- Finish tests for `createItem` and `updateItem` Hooks
- Add `deleteItem` Hook

## GM Notes example
    if (game.user.isGM) {
        let labelTxt = '';
        let labelStyle= "";
        let title = game.i18n.localize('GMNote.label');
        let notes = app.entity.getFlag('gm-notes', 'notes');
        if (game.settings.get('gm-notes', 'hideLabel') === false) {
            labelTxt = ' ' + title;
        }
        if (game.settings.get('gm-notes', 'colorLabel') === true && notes) {
            labelStyle = "style='color:green;'";
        }
        let openBtn = $(`<a class="open-gm-note" title="${title}" ${labelStyle} ><i class="fas fa-clipboard${notes ? '-check':''}"></i>${labelTxt}</a>`);
        openBtn.click(ev => {
            let noteApp = null;
            for (let key in app.entity.apps) {
                let obj = app.entity.apps[key];
                if (obj instanceof GMNote) {
                    noteApp = obj;
                    break;
                }
            }
            if (!noteApp) noteApp = new GMNote(app.entity, { submitOnClose: true, closeOnSubmit: false, submitOnUnfocus: true });
            noteApp.render(true);
        });
        html.closest('.app').find('.open-gm-note').remove();
        let titleElement = html.closest('.app').find('.window-title');
        openBtn.insertAfter(titleElement);
    }

## Helpful commands
- `canvas.tokens.controlled[0].actor.getFlag('actor-history', 'history')`
- `await canvas.tokens.controlled[0].actor.setFlag('actor-history', 'history', [])`
- `CONFIG.debug.hooks = true`
- `game.actors.directory.documents.filter(target => target.type === 'character'); (or 'npc')`