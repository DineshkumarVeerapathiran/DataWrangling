using AngularData.Prose.Prose.Substrings;
using System.IO;
using System.Reflection;

namespace AngularData.Prose.Prose.Substrings
{
    public static class GrammarText
    {
        public static string Get()
        {
            //AngularData.Prose.ProseSample.Substrings.Semantics.g
            var assembly = typeof(GrammarText).GetTypeInfo().Assembly;
            using (var stream = assembly.GetManifestResourceStream("AngularData.Prose.Prose.Substrings.Prose.Substrings.grammar"))
            using (var reader = new StreamReader(stream))
            {
                return reader.ReadToEnd();
            }
        }
    }
}
