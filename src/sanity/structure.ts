import type {StructureResolver} from 'sanity/structure'

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Blog')
    .items([
      S.documentTypeListItem('bio').title('Bio'),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (item) => item.getId() && !['bio'].includes(item.getId()!),
      ),
    ])
