"use client"

import { Disclosure } from '@headlessui/react'
import { MinusSmallIcon, PlusSmallIcon } from '@heroicons/react/24/outline'

const faqs = [
  {
    question: "Comment ajouter une note ?",
    answer:
      "Vous avez simplement à vous rendre dans la page journal puis sélectionner la date souhaitée dans le calendrier puis enregistrer votre note en cliquant sur le micro",
  },
  {
    question: "Est-il possible de modifier sa note ?",
    answer:
      "Bien sûr ! Vous pouvez supprimer votre note pour ensuite la refaire",
  },
  {
    question: "À quoi sert le Chat ?",
    answer:
      "Il sert à retrouver rapidement et facilement une note antérieure. Pour ce faire vous avez juste à envoyer la date souhaitée et l'assistant vous affichera votre note du jour souhaité !",
  },
  {
    question: "Est-ce que c'est payant ?",
    answer:
      "Non, tout est totalement gratuit !",
  },
]

export default function Example() {
  return (
    <div className="bg-gray-900">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-4xl divide-y divide-white/10">
          <h2 className="text-2xl font-bold leading-10 tracking-tight text-white">Foire aux questions</h2>
          <dl className="mt-10 space-y-6 divide-y divide-white/10">
            {faqs.map((faq) => (
              <Disclosure as="div" key={faq.question} className="pt-6">
                {({ open }) => (
                  <>
                    <dt>
                      <Disclosure.Button className="flex w-full items-start justify-between text-left text-white">
                        <span className="text-base font-semibold leading-7">{faq.question}</span>
                        <span className="ml-6 flex h-7 items-center">
                          {open ? (
                            <MinusSmallIcon className="h-6 w-6" aria-hidden="true" />
                          ) : (
                            <PlusSmallIcon className="h-6 w-6" aria-hidden="true" />
                          )}
                        </span>
                      </Disclosure.Button>
                    </dt>
                    <Disclosure.Panel as="dd" className="mt-2 pr-12">
                      <p className="text-base leading-7 text-gray-300">{faq.answer}</p>
                    </Disclosure.Panel>
                  </>
                )}
              </Disclosure>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
